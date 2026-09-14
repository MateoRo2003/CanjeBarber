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
        <h1 className="text-xl font-bold text-foreground">
          Cuenta deshabilitada
        </h1>
        <p className="text-sm text-muted">
          Tu cuenta fue deshabilitada. Consultá con el barbero si creés que
          es un error.
        </p>
        <form action={cerrarSesion}>
          <button className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90">
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
  // Cuánto le falta para el próximo premio, como barra de progreso.
  const progreso = proximoPremio
    ? Math.round((cliente.puntosActuales / proximoPremio.puntosCosto) * 100)
    : 100;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-soft">Hola,</p>
          <h1 className="text-xl font-bold text-foreground">
            {cliente.nombre}
          </h1>
        </div>
        <form action={cerrarSesion}>
          <button className="text-sm text-muted-faint underline underline-offset-2 hover:text-muted">
            Cerrar sesión
          </button>
        </form>
      </header>

      {/* Tarjeta de puntos: el centro de la app. Verde profundo de la
          paleta (Pakistan → Dark Green) con un halo Reseda para que no
          quede un bloque plano. */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-moss via-surface-dark to-surface-darkest px-6 py-8 text-center shadow-lg shadow-forest/20 ring-1 ring-moss/50">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-reseda/25 blur-3xl"
        />
        <div className="relative flex flex-col gap-3">
          <p className="text-xs font-medium tracking-[0.18em] text-on-dark-muted uppercase">
            Tus puntos
          </p>
          <p className="text-6xl font-bold tabular-nums text-on-dark">
            {cliente.puntosActuales}
          </p>
          {proximoPremio ? (
            <div className="flex flex-col gap-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-on-dark/15">
                <div
                  className="h-full rounded-full bg-reseda"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <p className="text-sm text-on-dark-muted">
                Te faltan{" "}
                <span className="font-semibold text-on-dark">
                  {proximoPremio.puntosCosto - cliente.puntosActuales}
                </span>{" "}
                puntos para &ldquo;{proximoPremio.nombre}&rdquo;
              </p>
            </div>
          ) : (
            premios.length > 0 && (
              <p className="text-sm text-on-dark-muted">
                Te alcanza para todos los premios. Pasá por la barbería a
                canjear.
              </p>
            )
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">
            Premios disponibles
          </h2>
          <a
            href="/perfil/historial"
            className="text-sm text-muted-soft underline underline-offset-2 transition hover:text-foreground"
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
