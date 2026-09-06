import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { cerrarSesion } from "@/app/actions";
import { BotonSubmit } from "@/components/boton-submit";
import { SkeletonLista } from "@/components/skeleton";
import { crearServicio, crearPremio } from "./actions";
import { ClientesSection } from "./clientes-section";
import { CanjesSection } from "./canjes-section";
import { ServiciosSection } from "./servicios-section";
import { PremiosSection } from "./premios-section";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (!session.user.isAdmin) redirect("/perfil");

  const { q } = await searchParams;
  const query = (q ?? "").trim();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">
          Panel de administración
        </h1>
        <div className="flex items-center gap-4">
          <a
            href="/admin/qr-local"
            className="text-sm text-stone-500 underline underline-offset-2 transition hover:text-stone-700"
          >
            QR del local
          </a>
          <form action={cerrarSesion}>
            <button className="text-sm text-stone-500 underline underline-offset-2 transition hover:text-stone-700">
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {/* Buscador de clientes + sumar puntos */}
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold">Clientes</h2>
        <form className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Buscar por nombre o email…"
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:border-stone-400 focus:border-stone-500 focus:outline-none"
          />
          <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700">
            Buscar
          </button>
        </form>
        <Suspense key={query} fallback={<SkeletonLista filas={3} />}>
          <ClientesSection query={query} />
        </Suspense>
      </section>

      {/* Canjes recientes */}
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Canjes recientes</h2>
        <Suspense fallback={<SkeletonLista filas={2} />}>
          <CanjesSection />
        </Suspense>
      </section>

      {/* Gestión de servicios */}
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Servicios</h2>
        <form
          action={crearServicio}
          className="flex flex-wrap items-end gap-2"
        >
          <div className="flex flex-col">
            <label className="text-xs text-stone-500">Nombre</label>
            <input
              name="nombre"
              required
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:border-stone-400 focus:border-stone-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-stone-500">Puntos</label>
            <input
              name="puntosOtorgados"
              type="number"
              min={1}
              required
              className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:border-stone-400 focus:border-stone-500 focus:outline-none"
            />
          </div>
          <BotonSubmit
            pendingText="Agregando…"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Agregar
          </BotonSubmit>
        </form>
        <Suspense fallback={<SkeletonLista filas={2} />}>
          <ServiciosSection />
        </Suspense>
      </section>

      {/* Gestión de premios */}
      <section className="flex flex-col gap-3 pb-10">
        <h2 className="font-semibold">Premios</h2>
        <form action={crearPremio} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-stone-500">Nombre</label>
            <input
              name="nombre"
              required
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:border-stone-400 focus:border-stone-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-stone-500">Puntos costo</label>
            <input
              name="puntosCosto"
              type="number"
              min={1}
              required
              className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:border-stone-400 focus:border-stone-500 focus:outline-none"
            />
          </div>
          <BotonSubmit
            pendingText="Agregando…"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Agregar
          </BotonSubmit>
        </form>
        <Suspense fallback={<SkeletonLista filas={2} />}>
          <PremiosSection />
        </Suspense>
      </section>
    </main>
  );
}
