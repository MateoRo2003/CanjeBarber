import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cerrarSesion } from "@/app/actions";
import {
  sumarPuntos,
  crearServicio,
  toggleServicio,
  crearPremio,
  togglePremio,
} from "./actions";

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

  const [clientes, servicios, premios, canjesRecientes] = await Promise.all([
    prisma.cliente.findMany({
      where: query
        ? {
            OR: [
              { nombre: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { fechaRegistro: "desc" },
      take: 10,
    }),
    prisma.servicio.findMany({ orderBy: { creadoEn: "desc" } }),
    prisma.premio.findMany({ orderBy: { creadoEn: "desc" } }),
    prisma.transaccion.findMany({
      where: { tipo: "CANJE" },
      orderBy: { fecha: "desc" },
      take: 15,
      include: { cliente: true },
    }),
  ]);

  const premiosPorId = new Map(premios.map((p) => [p.id, p]));
  const servicioActivo = servicios.some((s) => s.activo);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">
          Panel de administración
        </h1>
        <div className="flex items-center gap-4">
          <a
            href="/admin/qr-local"
            className="text-sm text-stone-500 underline"
          >
            QR del local
          </a>
          <form action={cerrarSesion}>
            <button className="text-sm text-stone-500 underline">
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
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white">
            Buscar
          </button>
        </form>
        {!query && (
          <p className="text-xs text-stone-500">
            Mostrando los clientes registrados más recientes.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {clientes.length === 0 && (
            <p className="text-sm text-stone-500">Sin resultados.</p>
          )}
          {clientes.map((cliente) => (
            <li
              key={cliente.id}
              className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{cliente.nombre}</p>
                <p className="text-sm text-stone-500">{cliente.email}</p>
                <p className="text-sm text-stone-500">
                  {cliente.puntosActuales} puntos
                </p>
              </div>
              {servicioActivo ? (
                <form action={sumarPuntos} className="flex gap-2">
                  <input type="hidden" name="clienteId" value={cliente.id} />
                  <select
                    name="servicioId"
                    required
                    className="rounded-lg border border-stone-300 px-2 py-2 text-sm"
                  >
                    {servicios
                      .filter((s) => s.activo)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} (+{s.puntosOtorgados})
                        </option>
                      ))}
                  </select>
                  <button className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white">
                    Sumar
                  </button>
                </form>
              ) : (
                <p className="text-xs text-stone-400">
                  Cargá un servicio activo para poder sumar puntos.
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Canjes recientes */}
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Canjes recientes</h2>
        {canjesRecientes.length === 0 && (
          <p className="text-sm text-stone-500">Todavía no hay canjes.</p>
        )}
        <ul className="flex flex-col gap-2">
          {canjesRecientes.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm"
            >
              <span>
                <strong>{t.cliente.nombre}</strong> canjeó{" "}
                {premiosPorId.get(t.referenciaId)?.nombre ?? "premio eliminado"}
              </span>
              <span className="text-stone-500">
                {new Date(t.fecha).toLocaleString("es-AR")}
              </span>
            </li>
          ))}
        </ul>
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
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-stone-500">Puntos</label>
            <input
              name="puntosOtorgados"
              type="number"
              min={1}
              required
              className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white">
            Agregar
          </button>
        </form>
        <ul className="flex flex-col gap-2">
          {servicios.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm"
            >
              <span>
                {s.nombre} · {s.puntosOtorgados} pts{" "}
                {!s.activo && (
                  <span className="text-stone-400">(inactivo)</span>
                )}
              </span>
              <form action={toggleServicio}>
                <input type="hidden" name="id" value={s.id} />
                <button className="text-xs underline">
                  {s.activo ? "Desactivar" : "Activar"}
                </button>
              </form>
            </li>
          ))}
        </ul>
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
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-stone-500">Puntos costo</label>
            <input
              name="puntosCosto"
              type="number"
              min={1}
              required
              className="w-24 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white">
            Agregar
          </button>
        </form>
        <ul className="flex flex-col gap-2">
          {premios.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-1 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm"
            >
              <div className="flex items-center justify-between">
                <span>
                  {p.nombre} · {p.puntosCosto} pts{" "}
                  {!p.activo && (
                    <span className="text-stone-400">(inactivo)</span>
                  )}
                </span>
                <form action={togglePremio}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="text-xs underline">
                    {p.activo ? "Desactivar" : "Activar"}
                  </button>
                </form>
              </div>
              <a
                href={`/admin/premios/${p.id}/qr`}
                className="text-xs text-stone-500 underline"
              >
                Ver / imprimir QR de canje (/canjear/{p.id})
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
