import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cerrarSesion } from "@/app/actions";
import { SkeletonLista } from "@/components/skeleton";
import { PremiosSection } from "./premios-section";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.clienteId) redirect("/");
  if (session.user.isAdmin) redirect("/admin");

  const cliente = await prisma.cliente.findUnique({
    where: { id: session.user.clienteId },
  });
  if (!cliente) redirect("/");

  if (!cliente.activo) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <h1 className="text-xl font-bold text-stone-900">
          Cuenta deshabilitada
        </h1>
        <p className="text-sm text-stone-600">
          Tu cuenta fue deshabilitada. Consultá con el barbero si creés que
          es un error.
        </p>
        <form action={cerrarSesion}>
          <button className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90">
            Cerrar sesión
          </button>
        </form>
      </main>
    );
  }

  const premios = await prisma.premio.findMany({
    where: { activo: true },
    orderBy: { puntosCosto: "asc" },
  });

  const proximoPremio = premios.find(
    (p) => p.puntosCosto > cliente.puntosActuales,
  );

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">Hola,</p>
          <h1 className="text-xl font-bold text-stone-900">
            {cliente.nombre}
          </h1>
        </div>
        <form action={cerrarSesion}>
          <button className="text-sm text-stone-400 underline underline-offset-2 hover:text-stone-600">
            Cerrar sesión
          </button>
        </form>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl bg-stone-900 px-6 py-8 text-center text-white">
        <p className="text-sm tracking-wide text-stone-400 uppercase">
          Tus puntos
        </p>
        <p className="text-6xl font-bold tabular-nums text-accent-foreground">
          {cliente.puntosActuales}
        </p>
        {proximoPremio && (
          <p className="text-sm text-stone-300">
            Te faltan{" "}
            <span className="font-semibold text-accent-foreground">
              {proximoPremio.puntosCosto - cliente.puntosActuales}
            </span>{" "}
            puntos para &ldquo;{proximoPremio.nombre}&rdquo;
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">
            Premios disponibles
          </h2>
          <a
            href="/perfil/historial"
            className="text-sm text-stone-500 underline underline-offset-2 transition hover:text-stone-700"
          >
            Ver historial
          </a>
        </div>
        <Suspense fallback={<SkeletonLista filas={3} />}>
          <PremiosSection puntosActuales={cliente.puntosActuales} />
        </Suspense>
      </section>
    </main>
  );
}
