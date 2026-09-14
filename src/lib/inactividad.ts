import { prisma } from "@/lib/prisma";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export type ResultadoInactividad = {
  evaluados: number;
  penalizados: number;
  puntosDescontados: number;
};

/**
 * Recorre los clientes activos con puntos y le descuenta a los que llevan
 * sin actividad más que el período que configuró el admin — dónde
 * "actividad" es cualquiera de las señales que el admin marcó (login,
 * canje, o sumar puntos por un beneficio).
 *
 * El descuento es PROGRESIVO: no es un único castigo. Mientras el cliente
 * siga sin volver, se le vuelve a descontar cada vez que pasa otro
 * período completo — el "reloj" para el próximo descuento arranca desde
 * la última penalización (o desde la última actividad, lo que sea más
 * reciente), nunca desde el principio de los tiempos.
 *
 * Nunca deja el saldo en negativo (mismo criterio que ajustarPuntos en
 * admin/actions.ts): si al cliente le quedan menos puntos que
 * inactividadPuntos, se le descuenta lo que tenga.
 *
 * La llaman tanto el cron diario (src/app/api/cron/inactividad/route.ts)
 * como el botón "Ejecutar revisión ahora" del panel de admin.
 */
export async function aplicarPenalizacionesInactividad(): Promise<ResultadoInactividad> {
  const resultado: ResultadoInactividad = {
    evaluados: 0,
    penalizados: 0,
    puntosDescontados: 0,
  };

  const config = await prisma.configuracion.findUnique({
    where: { id: "config" },
  });

  if (
    !config?.inactividadActiva ||
    config.inactividadDias <= 0 ||
    config.inactividadPuntos <= 0
  ) {
    return resultado;
  }

  // Sin ninguna condición marcada no hay forma de medir "actividad" — no
  // se puede castigar a nadie (esto ya lo valida guardarConfigInactividad
  // al guardar, pero se repite acá por las dudas de que la config haya
  // quedado en un estado raro).
  if (
    !config.inactividadConsideraLogin &&
    !config.inactividadConsideraCanje &&
    !config.inactividadConsideraSuma
  ) {
    return resultado;
  }

  const clientes = await prisma.cliente.findMany({
    where: { activo: true, puntosActuales: { gt: 0 } },
    select: {
      id: true,
      puntosActuales: true,
      fechaRegistro: true,
      ultimoLogin: true,
    },
  });

  const ahora = Date.now();
  const periodoMs = config.inactividadDias * MS_POR_DIA;

  for (const cliente of clientes) {
    resultado.evaluados++;

    // Última señal de actividad según lo que el admin marcó como válido.
    // fechaRegistro siempre cuenta como piso (un cliente recién anotado
    // no puede estar "inactivo" desde antes de existir).
    const señales: Date[] = [cliente.fechaRegistro];
    if (config.inactividadConsideraLogin && cliente.ultimoLogin) {
      señales.push(cliente.ultimoLogin);
    }
    if (config.inactividadConsideraCanje) {
      const ultimoCanje = await prisma.transaccion.findFirst({
        where: { clienteId: cliente.id, tipo: "CANJE" },
        orderBy: { fecha: "desc" },
        select: { fecha: true },
      });
      if (ultimoCanje) señales.push(ultimoCanje.fecha);
    }
    if (config.inactividadConsideraSuma) {
      const ultimaSuma = await prisma.transaccion.findFirst({
        where: { clienteId: cliente.id, tipo: "SUMA" },
        orderBy: { fecha: "desc" },
        select: { fecha: true },
      });
      if (ultimaSuma) señales.push(ultimaSuma.fecha);
    }
    const ultimaActividad = new Date(
      Math.max(...señales.map((f) => f.getTime())),
    );

    // Si ya se le descontó antes por esta misma racha de inactividad, el
    // próximo período se cuenta desde esa penalización, no desde la
    // actividad original — así es progresivo en vez de un tope único.
    const ultimaPenalizacion = await prisma.transaccion.findFirst({
      where: { clienteId: cliente.id, tipo: "PENALIZACION" },
      orderBy: { fecha: "desc" },
      select: { fecha: true },
    });
    const anchor =
      ultimaPenalizacion && ultimaPenalizacion.fecha > ultimaActividad
        ? ultimaPenalizacion.fecha
        : ultimaActividad;

    if (ahora - anchor.getTime() < periodoMs) continue;

    const puntosADescontar = Math.min(
      config.inactividadPuntos,
      cliente.puntosActuales,
    );
    if (puntosADescontar <= 0) continue;

    await prisma.$transaction([
      prisma.cliente.update({
        where: { id: cliente.id },
        data: { puntosActuales: { decrement: puntosADescontar } },
      }),
      prisma.transaccion.create({
        data: {
          clienteId: cliente.id,
          tipo: "PENALIZACION",
          referenciaId: "inactividad",
          puntos: -puntosADescontar,
          nota: `${config.inactividadDias} días sin actividad`,
        },
      }),
    ]);

    resultado.penalizados++;
    resultado.puntosDescontados += puntosADescontar;
  }

  return resultado;
}
