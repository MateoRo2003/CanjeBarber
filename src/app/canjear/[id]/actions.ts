"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function confirmarCanje(premioId: string) {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const cliente = await prisma.cliente.findUnique({
    where: { email: session.user.email },
  });
  if (!cliente) redirect("/");

  const premio = await prisma.premio.findUnique({ where: { id: premioId } });
  if (!premio || !premio.activo) {
    throw new Error("Este premio ya no está disponible.");
  }

  // Se revalida acá adentro de una transacción para evitar que, si el
  // cliente abre dos veces la confirmación, se le resten los puntos dos
  // veces (double-submit).
  await prisma.$transaction(async (tx) => {
    const clienteActual = await tx.cliente.findUniqueOrThrow({
      where: { id: cliente.id },
    });

    if (clienteActual.puntosActuales < premio.puntosCosto) {
      throw new Error("No alcanzan los puntos para este canje.");
    }

    await tx.cliente.update({
      where: { id: cliente.id },
      data: { puntosActuales: { decrement: premio.puntosCosto } },
    });

    await tx.transaccion.create({
      data: {
        clienteId: cliente.id,
        tipo: "CANJE",
        referenciaId: premio.id,
        puntos: -premio.puntosCosto,
      },
    });
  });

  redirect(`/canjear/${premioId}/listo`);
}
