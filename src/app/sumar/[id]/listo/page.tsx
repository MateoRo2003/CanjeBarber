import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function SumaListaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const [cliente, servicio] = await Promise.all([
    prisma.cliente.findUnique({ where: { email: session.user.email } }),
    prisma.servicio.findUnique({ where: { id } }),
  ]);
  if (!cliente || !servicio) redirect("/perfil");

  const ultimaSuma = await prisma.transaccion.findFirst({
    where: { clienteId: cliente.id, tipo: "SUMA", referenciaId: servicio.id },
    orderBy: { fecha: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
        <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
      </div>
      <h1 className="text-2xl font-bold text-stone-900">Puntos sumados</h1>
      <p className="text-stone-700">
        +{servicio.puntosOtorgados} puntos por {servicio.nombre}
      </p>
      {ultimaSuma && (
        <p className="text-sm text-stone-500">
          {new Date(ultimaSuma.fecha).toLocaleString("es-AR")}
        </p>
      )}
      <p className="text-sm text-stone-500">
        Ahora tenés{" "}
        <span className="font-semibold text-stone-900">
          {cliente.puntosActuales}
        </span>{" "}
        puntos.
      </p>
      <Link
        href="/perfil"
        className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Volver a mi perfil
      </Link>
    </main>
  );
}
