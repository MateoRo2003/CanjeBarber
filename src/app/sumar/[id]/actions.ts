"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inicioDeHoyAR } from "@/lib/fecha";
import { avisarActividad } from "@/lib/realtime-admin";

export async function confirmarSuma(servicioId: string) {
  const session = await auth();
  if (!session?.user?.clienteId) redirect("/");

  const cliente = await prisma.cliente.findUnique({
    where: { id: session.user.clienteId },
  });
  if (!cliente) redirect("/");
  if (!cliente.activo) {
    throw new Error("Tu cuenta fue deshabilitada. Consultá con el barbero.");
  }

  const servicio = await prisma.servicio.findUnique({
    where: { id: servicioId },
  });
  if (!servicio || !servicio.activo) {
    throw new Error("Este servicio ya no está disponible.");
  }

  await prisma.$transaction(async (tx) => {
    // Un mismo cliente no puede sumar el mismo servicio más de una vez
    // por día (evita que reutilice una foto del QR desde su casa). Se
    // revalida acá adentro, ya con lock de transacción, para que dos
    // escaneos casi simultáneos no se cuelen los dos.
    const yaSumadoHoy = await tx.transaccion.findFirst({
      where: {
        clienteId: cliente.id,
        tipo: "SUMA",
        referenciaId: servicio.id,
        fecha: { gte: inicioDeHoyAR() },
      },
    });
    if (yaSumadoHoy) {
      throw new Error("YA_SUMADO_HOY");
    }

    await tx.cliente.update({
      where: { id: cliente.id },
      data: { puntosActuales: { increment: servicio.puntosOtorgados } },
    });

    await tx.transaccion.create({
      data: {
        clienteId: cliente.id,
        tipo: "SUMA",
        referenciaId: servicio.id,
        puntos: servicio.puntosOtorgados,
      },
    });
  });

  await avisarActividad({
    tipo: "SUMA",
    clienteNombre: cliente.nombre,
    detalle: servicio.nombre,
    puntos: servicio.puntosOtorgados,
  });

  redirect(`/sumar/${servicioId}/listo`);
}
