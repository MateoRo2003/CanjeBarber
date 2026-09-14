import { prisma } from "@/lib/prisma";
import type { Cliente } from "@/generated/prisma/client";

const ID_CONFIGURACION = "config";
const REFERENCIA_BONUS = "bienvenida";

/**
 * Si el admin activó el "bono de bienvenida" en /admin (puntos por primer
 * login / primer registro), se lo suma al Cliente recién creado y deja
 * constancia en su historial (Transaccion tipo BONUS). Se llama una única
 * vez, justo después de crear el Cliente — nunca en logins siguientes.
 *
 * Atrapa cualquier error en vez de propagarlo: esto es un extra sobre el
 * alta del cliente, no debería poder tumbar el login si algo sale mal acá
 * (misma filosofía que avisarActividad en realtime-admin.ts).
 */
export async function otorgarBonusBienvenida(cliente: Cliente): Promise<Cliente> {
  try {
    const config = await prisma.configuracion.findUnique({
      where: { id: ID_CONFIGURACION },
    });
    if (!config?.bienvenidaActiva || config.puntosBienvenida <= 0) {
      return cliente;
    }

    const [actualizado] = await prisma.$transaction([
      prisma.cliente.update({
        where: { id: cliente.id },
        data: { puntosActuales: { increment: config.puntosBienvenida } },
      }),
      prisma.transaccion.create({
        data: {
          clienteId: cliente.id,
          tipo: "BONUS",
          referenciaId: REFERENCIA_BONUS,
          puntos: config.puntosBienvenida,
        },
      }),
    ]);

    return actualizado;
  } catch (error) {
    console.error("No se pudo otorgar el bono de bienvenida:", error);
    return cliente;
  }
}
