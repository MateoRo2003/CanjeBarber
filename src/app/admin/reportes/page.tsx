import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function inicioHace(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d;
}

export default async function ReportesPage() {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (!session.user.isAdmin) redirect("/perfil");

  const [
    totalClientes,
    clientesNuevos30d,
    sumaPuntosCirculacion,
    otorgadoPorServicio,
    canjeadoPorPremio,
    servicios,
    premios,
    clientesSinActividad,
  ] = await Promise.all([
    prisma.cliente.count(),
    prisma.cliente.count({ where: { fechaRegistro: { gte: inicioHace(30) } } }),
    prisma.cliente.aggregate({ _sum: { puntosActuales: true } }),
    prisma.transaccion.groupBy({
      by: ["referenciaId"],
      where: { tipo: "SUMA" },
      _count: { _all: true },
      _sum: { puntos: true },
    }),
    prisma.transaccion.groupBy({
      by: ["referenciaId"],
      where: { tipo: "CANJE" },
      _count: { _all: true },
      _sum: { puntos: true },
    }),
    prisma.servicio.findMany(),
    prisma.premio.findMany(),
    prisma.cliente.count({ where: { transacciones: { none: {} } } }),
  ]);

  const nombreServicio = new Map(servicios.map((s) => [s.id, s.nombre]));
  const nombrePremio = new Map(premios.map((p) => [p.id, p.nombre]));

  const rankingServicios = otorgadoPorServicio
    .map((row) => ({
      nombre: nombreServicio.get(row.referenciaId) ?? "servicio eliminado",
      veces: row._count._all,
      puntos: row._sum.puntos ?? 0,
    }))
    .sort((a, b) => b.veces - a.veces);

  const rankingPremios = canjeadoPorPremio
    .map((row) => ({
      nombre: nombrePremio.get(row.referenciaId) ?? "premio eliminado",
      veces: row._count._all,
      puntos: Math.abs(row._sum.puntos ?? 0),
    }))
    .sort((a, b) => b.veces - a.veces);

  const totalOtorgado = rankingServicios.reduce((acc, r) => acc + r.puntos, 0);
  const totalCanjeado = rankingPremios.reduce((acc, r) => acc + r.puntos, 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Reportes de uso</h1>
        <a
          href="/admin"
          className="text-sm text-muted-soft underline underline-offset-2 transition hover:text-foreground"
        >
          ← Volver al panel
        </a>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Kpi label="Clientes totales" valor={totalClientes} />
        <Kpi label="Nuevos (30 días)" valor={clientesNuevos30d} />
        <Kpi
          label="Puntos en circulación"
          valor={sumaPuntosCirculacion._sum.puntosActuales ?? 0}
        />
        <Kpi label="Total otorgado (histórico)" valor={totalOtorgado} />
        <Kpi label="Total canjeado (histórico)" valor={totalCanjeado} />
        <Kpi
          label="Clientes sin actividad"
          valor={clientesSinActividad}
          alerta={clientesSinActividad > 0}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-foreground">
          Servicios más usados
        </h2>
        {rankingServicios.length === 0 ? (
          <p className="text-sm text-muted-soft">
            Todavía no hay puntos sumados por ningún servicio.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rankingServicios.map((r) => (
              <li
                key={r.nombre}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2 text-sm"
              >
                <span>{r.nombre}</span>
                <span className="text-muted-soft">
                  {r.veces} veces · {r.puntos} pts otorgados
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 pb-10">
        <h2 className="font-semibold text-foreground">Premios más canjeados</h2>
        {rankingPremios.length === 0 ? (
          <p className="text-sm text-muted-soft">Todavía no hay canjes.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rankingPremios.map((r) => (
              <li
                key={r.nombre}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2 text-sm"
              >
                <span>{r.nombre}</span>
                <span className="text-muted-soft">
                  {r.veces} veces · {r.puntos} pts canjeados
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Kpi({
  label,
  valor,
  alerta = false,
}: {
  label: string;
  valor: number;
  alerta?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${
        alerta
          ? "border-danger-border bg-danger-surface"
          : "border-border bg-surface"
      }`}
    >
      <p className="text-2xl font-bold tabular-nums text-foreground">
        {valor}
      </p>
      <p className="text-xs text-muted-soft">{label}</p>
    </div>
  );
}
