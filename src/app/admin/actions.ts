"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function sumarPuntos(formData: FormData) {
  await requireAdmin();

  const clienteId = String(formData.get("clienteId") ?? "");
  const servicioId = String(formData.get("servicioId") ?? "");
  if (!clienteId || !servicioId) throw new Error("Faltan datos.");

  const servicio = await prisma.servicio.findUnique({
    where: { id: servicioId },
  });
  if (!servicio || !servicio.activo) {
    throw new Error("Servicio inválido.");
  }

  await prisma.$transaction([
    prisma.cliente.update({
      where: { id: clienteId },
      data: { puntosActuales: { increment: servicio.puntosOtorgados } },
    }),
    prisma.transaccion.create({
      data: {
        clienteId,
        tipo: "SUMA",
        referenciaId: servicio.id,
        puntos: servicio.puntosOtorgados,
      },
    }),
  ]);

  revalidatePath("/admin");
}

export async function crearServicio(formData: FormData) {
  await requireAdmin();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const puntos = Number(formData.get("puntosOtorgados"));
  if (!nombre || !Number.isFinite(puntos) || puntos <= 0) {
    throw new Error("Datos de servicio inválidos.");
  }

  await prisma.servicio.create({
    data: { nombre, puntosOtorgados: puntos },
  });
  revalidatePath("/admin");
}

export async function toggleServicio(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const servicio = await prisma.servicio.findUniqueOrThrow({ where: { id } });
  await prisma.servicio.update({
    where: { id },
    data: { activo: !servicio.activo },
  });
  revalidatePath("/admin");
}

export async function crearPremio(formData: FormData) {
  await requireAdmin();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const puntos = Number(formData.get("puntosCosto"));
  if (!nombre || !Number.isFinite(puntos) || puntos <= 0) {
    throw new Error("Datos de premio inválidos.");
  }

  await prisma.premio.create({
    data: { nombre, puntosCosto: puntos },
  });
  revalidatePath("/admin");
}

export async function togglePremio(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const premio = await prisma.premio.findUniqueOrThrow({ where: { id } });
  await prisma.premio.update({
    where: { id },
    data: { activo: !premio.activo },
  });
  revalidatePath("/admin");
}

export async function editarServicio(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const puntos = Number(formData.get("puntosOtorgados"));
  if (!id || !nombre || !Number.isFinite(puntos) || puntos <= 0) {
    throw new Error("Datos de servicio inválidos.");
  }

  await prisma.servicio.update({
    where: { id },
    data: { nombre, puntosOtorgados: puntos },
  });
  revalidatePath("/admin");
}

export async function eliminarServicio(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.servicio.delete({ where: { id } });
  revalidatePath("/admin");
}

export async function editarPremio(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const puntos = Number(formData.get("puntosCosto"));
  if (!id || !nombre || !Number.isFinite(puntos) || puntos <= 0) {
    throw new Error("Datos de premio inválidos.");
  }

  await prisma.premio.update({
    where: { id },
    data: { nombre, puntosCosto: puntos },
  });
  revalidatePath("/admin");
}

export async function eliminarPremio(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.premio.delete({ where: { id } });
  revalidatePath("/admin");
}

/**
 * Ajuste manual de puntos (corrección, cortesía, descuento por error,
 * etc.), sin pasar por un servicio o premio. `delta` puede ser positivo
 * (suma) o negativo (resta) — nunca se permite que el saldo quede
 * negativo.
 */
export async function ajustarPuntos(formData: FormData) {
  await requireAdmin();

  const clienteId = String(formData.get("clienteId") ?? "");
  const delta = Number(formData.get("delta"));
  const nota = String(formData.get("nota") ?? "").trim();

  if (!clienteId || !Number.isFinite(delta) || !Number.isInteger(delta) || delta === 0) {
    throw new Error("Ingresá una cantidad de puntos válida (positiva o negativa, distinta de 0).");
  }
  if (!nota) {
    throw new Error("Contá el motivo del ajuste.");
  }

  await prisma.$transaction(async (tx) => {
    const cliente = await tx.cliente.findUniqueOrThrow({
      where: { id: clienteId },
    });

    const nuevoTotal = cliente.puntosActuales + delta;
    if (nuevoTotal < 0) {
      throw new Error(
        `No se puede: le quedarían ${nuevoTotal} puntos. Como mucho podés restarle ${cliente.puntosActuales}.`,
      );
    }

    await tx.cliente.update({
      where: { id: clienteId },
      data: { puntosActuales: nuevoTotal },
    });

    await tx.transaccion.create({
      data: {
        clienteId,
        tipo: "AJUSTE",
        referenciaId: "manual",
        puntos: delta,
        nota,
      },
    });
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/clientes/${clienteId}`);
}
