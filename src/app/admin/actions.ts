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
