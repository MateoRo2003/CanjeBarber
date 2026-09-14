import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BotonSubmit } from "@/components/boton-submit";
import { ajustarPuntos, toggleClienteActivo } from "../../actions";
import { EliminarCliente } from "./eliminar-cliente";

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");
  if (!session.user.isAdmin) redirect("/perfil");

  const { id } = await params;
  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente) notFound();

  const [transacciones, servicios, premios] = await Promise.all([
    prisma.transaccion.findMany({
      where: { clienteId: id },
      orderBy: { fecha: "desc" },
    }),
    prisma.servicio.findMany(),
    prisma.premio.findMany(),
  ]);

  const nombresPorId = new Map<string, string>([
    ...servicios.map((s) => [s.id, s.nombre] as const),
    ...premios.map((p) => [p.id, p.nombre] as const),
  ]);

  const totalSumado = transacciones
    .filter((t) => t.tipo === "SUMA")
    .reduce((acc, t) => acc + t.puntos, 0);
  const totalCanjeado = transacciones
    .filter((t) => t.tipo === "CANJE")
    .reduce((acc, t) => acc + Math.abs(t.puntos), 0);
  const totalAjustado = transacciones
    .filter((t) => t.tipo === "AJUSTE")
    .reduce((acc, t) => acc + t.puntos, 0);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
      <a
        href="/admin"
        className="text-sm text-muted-soft underline underline-offset-2 transition hover:text-foreground"
      >
        ← Volver al panel
      </a>

      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">
            {cliente.nombre}
          </h1>
          {!cliente.activo && (
            <span className="rounded-full bg-danger-surface px-2 py-0.5 text-xs font-medium text-danger">
              Deshabilitado
            </span>
          )}
        </div>
        <p className="text-sm text-muted-soft">
          {[cliente.email, cliente.telefono].filter(Boolean).join(" · ")}
        </p>
        <p className="text-xs text-muted-faint">
          Cliente desde{" "}
          {new Date(cliente.fechaRegistro).toLocaleDateString("es-AR")}
          {" · "}
          {cliente.ultimoLogin
            ? `Último login: ${new Date(cliente.ultimoLogin).toLocaleString("es-AR")}`
            : "Nunca volvió a iniciar sesión"}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Puntos actuales" valor={cliente.puntosActuales} />
        <Kpi label="Total sumado" valor={totalSumado} />
        <Kpi label="Total canjeado" valor={totalCanjeado} />
        <Kpi
          label="Ajustes manuales"
          valor={totalAjustado}
          signo={totalAjustado > 0 ? "+" : ""}
        />
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-foreground">Ajustar puntos</h2>
        <p className="text-xs text-muted-soft">
          Para correcciones o cortesías puntuales — no reemplaza sumar por
          beneficio. Un número negativo resta puntos.
        </p>
        <form action={ajustarPuntos} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="clienteId" value={cliente.id} />
          <div className="flex flex-col">
            <label className="text-xs text-muted-soft">Puntos (+/-)</label>
            <input
              name="delta"
              type="number"
              step={1}
              required
              placeholder="ej: 10 o -5"
              className="w-28 rounded-lg border border-border-strong px-3 py-2 text-sm transition hover:border-reseda focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex flex-1 flex-col">
            <label className="text-xs text-muted-soft">Motivo</label>
            <input
              name="nota"
              required
              placeholder="ej: cortesía por demora"
              className="w-full rounded-lg border border-border-strong px-3 py-2 text-sm transition hover:border-reseda focus:border-accent focus:outline-none"
            />
          </div>
          <BotonSubmit
            pendingText="Guardando…"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
          >
            Aplicar
          </BotonSubmit>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-foreground">
          Historial ({transacciones.length})
        </h2>
        {transacciones.length === 0 && (
          <p className="text-sm text-muted-soft">
            Todavía no tiene ninguna transacción.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {transacciones.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2 text-sm"
            >
              <div>
                <span
                  className={`font-medium ${
                    t.puntos >= 0 ? "text-accent" : "text-danger"
                  }`}
                >
                  {t.puntos >= 0 ? "+" : ""}
                  {t.puntos}
                </span>{" "}
                <span className="text-muted">
                  {t.tipo === "SUMA" &&
                    `sumó por ${nombresPorId.get(t.referenciaId) ?? "beneficio eliminado"}`}
                  {t.tipo === "CANJE" &&
                    `canjeó ${nombresPorId.get(t.referenciaId) ?? "premio eliminado"}`}
                  {t.tipo === "AJUSTE" && `ajuste manual: ${t.nota}`}
                  {t.tipo === "BONUS" && "bono de bienvenida"}
                  {t.tipo === "PENALIZACION" &&
                    `descuento por inactividad (${t.nota})`}
                </span>
              </div>
              <span className="shrink-0 text-muted-soft">
                {new Date(t.fecha).toLocaleString("es-AR")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
        <h2 className="font-semibold text-foreground">Zona de riesgo</h2>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {cliente.activo ? "Deshabilitar cuenta" : "Habilitar cuenta"}
            </p>
            <p className="text-xs text-muted-soft">
              {cliente.activo
                ? "No va a poder iniciar sesión ni usar la app. Conserva sus puntos e historial — se puede revertir cuando quieras."
                : "Va a poder volver a iniciar sesión y usar la app normalmente."}
            </p>
          </div>
          <form action={toggleClienteActivo}>
            <input type="hidden" name="id" value={cliente.id} />
            <BotonSubmit
              pendingText="…"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                cliente.activo
                  ? "border border-border-strong text-muted hover:bg-surface-muted"
                  : "bg-primary text-primary-foreground hover:bg-primary-hover"
              }`}
            >
              {cliente.activo ? "Deshabilitar" : "Habilitar"}
            </BotonSubmit>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Eliminar cliente
            </p>
            <p className="text-xs text-muted-soft">
              Borra la cuenta y todo su historial para siempre. No se puede
              deshacer.
            </p>
          </div>
          <EliminarCliente clienteId={cliente.id} clienteNombre={cliente.nombre} />
        </div>
      </section>
    </main>
  );
}

function Kpi({
  label,
  valor,
  signo = "",
}: {
  label: string;
  valor: number;
  signo?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-center">
      <p className="text-2xl font-bold tabular-nums text-foreground">
        {signo}
        {valor}
      </p>
      <p className="text-xs text-muted-soft">{label}</p>
    </div>
  );
}
