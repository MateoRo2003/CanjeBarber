import { prisma } from "@/lib/prisma";

// Canjes, ajustes y penalizaciones por inactividad — no incluye sumas
// normales por beneficio para no ensuciar la lista con lo rutinario; esto
// es lo que vale la pena que el admin vea de un vistazo (incluye ajustes
// y penalizaciones para poder auditarlos).
export async function CanjesSection() {
  const [transacciones, premios] = await Promise.all([
    prisma.transaccion.findMany({
      where: { tipo: { in: ["CANJE", "AJUSTE", "PENALIZACION"] } },
      orderBy: { fecha: "desc" },
      take: 15,
      include: { cliente: true },
    }),
    prisma.premio.findMany(),
  ]);

  const premiosPorId = new Map(premios.map((p) => [p.id, p]));

  if (transacciones.length === 0) {
    return (
      <p className="text-sm text-muted-soft">
        Todavía no hay canjes ni ajustes.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {transacciones.map((t) => (
        <li
          key={t.id}
          className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2 text-sm"
        >
          <span>
            <strong>{t.cliente.nombre}</strong>{" "}
            {t.tipo === "CANJE" &&
              `canjeó ${premiosPorId.get(t.referenciaId)?.nombre ?? "premio eliminado"}`}
            {t.tipo === "AJUSTE" &&
              `ajuste manual: ${t.puntos >= 0 ? "+" : ""}${t.puntos} pts (${t.nota})`}
            {t.tipo === "PENALIZACION" &&
              `descuento por inactividad: ${t.puntos} pts (${t.nota})`}
          </span>
          <span className="shrink-0 text-muted-soft">
            {new Date(t.fecha).toLocaleString("es-AR")}
          </span>
        </li>
      ))}
    </ul>
  );
}
