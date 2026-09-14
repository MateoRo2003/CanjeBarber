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
        className="text-sm text-stone-500 underline underline-offset-2 transition hover:text-stone-700"
      >
        ← Volver al panel
      </a>

      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-stone-900">
            {cliente.nombre}
          </h1>
          {!cliente.activo && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              Deshabilitado
            </span>
          )}
        </div>
        <p className="text-sm text-stone-500">
          {[cliente.email, cliente.telefono].filter(Boolean).join(" · ")}
        </p>
        <p className="text-xs text-stone-400">
          Cliente desde{" "}
          {new Date(cliente.fechaRegistro).toLocaleDateString("es-AR")}
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

      <section className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-semibold text-stone-900">Ajustar puntos</h2>
        <p className="text-xs text-stone-500">
          Para correcciones o cortesías puntuales — no reemplaza sumar por
          servicio. Un número negativo resta puntos.
        </p>
        <form action={ajustarPuntos} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="clienteId" value={cliente.id} />
          <div className="flex flex-col">
            <label className="text-xs text-stone-500">Puntos (+/-)</label>
            <input
              name="delta"
              type="number"
              step={1}
              required
              placeholder="ej: 10 o -5"
              className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:border-stone-400 focus:border-stone-500 focus:outline-none"
            />
          </div>
          <div className="flex flex-1 flex-col">
            <label className="text-xs text-stone-500">Motivo</label>
            <input
              name="nota"
              required
              placeholder="ej: cortesía por demora"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:border-stone-400 focus:border-stone-500 focus:outline-none"
            />
          </div>
          <BotonSubmit
            pendingText="Guardando…"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Aplicar
          </BotonSubmit>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-stone-900">
          Historial ({transacciones.length})
        </h2>
        {transacciones.length === 0 && (
          <p className="text-sm text-stone-500">
            Todavía no tiene ninguna transacción.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {transacciones.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm"
            >
              <div>
                <span
                  className={`font-medium ${
                    t.puntos >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {t.puntos >= 0 ? "+" : ""}
                  {t.puntos}
                </span>{" "}
                <span className="text-stone-700">
                  {t.tipo === "SUMA" &&
                    `sumó por ${nombresPorId.get(t.referenciaId) ?? "servicio eliminado"}`}
                  {t.tipo === "CANJE" &&
                    `canjeó ${nombresPorId.get(t.referenciaId) ?? "premio eliminado"}`}
                  {t.tipo === "AJUSTE" && `ajuste manual: ${t.nota}`}
                  {t.tipo === "BONUS" && "bono de bienvenida"}
                </span>
              </div>
              <span className="shrink-0 text-stone-500">
                {new Date(t.fecha).toLocaleString("es-AR")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-4">
        <h2 className="font-semibold text-stone-900">Zona de riesgo</h2>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 p-3">
          <div>
            <p className="text-sm font-medium text-stone-900">
              {cliente.activo ? "Deshabilitar cuenta" : "Habilitar cuenta"}
            </p>
            <p className="text-xs text-stone-500">
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
                  ? "border border-stone-300 text-stone-700 hover:bg-stone-100"
                  : "bg-stone-900 text-white hover:bg-stone-700"
              }`}
            >
              {cliente.activo ? "Deshabilitar" : "Habilitar"}
            </BotonSubmit>
          </form>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 p-3">
          <div>
            <p className="text-sm font-medium text-stone-900">
              Eliminar cliente
            </p>
            <p className="text-xs text-stone-500">
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
    <div className="rounded-xl border border-stone-200 bg-white p-3 text-center">
      <p className="text-2xl font-bold tabular-nums text-stone-900">
        {signo}
        {valor}
      </p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  );
}
