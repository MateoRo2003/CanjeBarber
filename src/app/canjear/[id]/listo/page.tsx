import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Comprobante que el cliente le muestra al barbero. El admin también ve
// este canje reflejado en su panel (lista de "canjes recientes").
export default async function CanjeListoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.clienteId) redirect("/");

  const [cliente, premio] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: session.user.clienteId } }),
    prisma.premio.findUnique({ where: { id } }),
  ]);
  if (!cliente || !premio) redirect("/perfil");

  const ultimoCanje = await prisma.transaccion.findFirst({
    where: { clienteId: cliente.id, tipo: "CANJE", referenciaId: premio.id },
    orderBy: { fecha: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-surface-dark to-surface-darkest text-on-dark shadow-md shadow-forest/25">
        <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Canje confirmado</h1>
      <p className="text-muted">{premio.nombre}</p>
      {ultimoCanje && (
        <p className="text-sm text-muted-soft">
          {new Date(ultimoCanje.fecha).toLocaleString("es-AR")}
        </p>
      )}
      <p className="text-sm text-muted-soft">
        Mostrale esta pantalla al barbero. Te quedan{" "}
        <span className="font-semibold text-foreground">
          {cliente.puntosActuales}
        </span>{" "}
        puntos.
      </p>
      <Link
        href="/perfil"
        className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
      >
        Volver a mi perfil
      </Link>
    </main>
  );
}
