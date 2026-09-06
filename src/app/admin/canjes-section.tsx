import { prisma } from "@/lib/prisma";

// Canjes y ajustes manuales — no incluye sumas normales por servicio para
// no ensuciar la lista con lo rutinario; esto es lo que vale la pena que
// el admin vea de un vistazo (incluye ajustes para poder auditarlos).
export async function CanjesSection() {
  const [transacciones, premios] = await Promise.all([
    prisma.transaccion.findMany({
      where: { tipo: { in: ["CANJE", "AJUSTE"] } },
      orderBy: { fecha: "desc" },
      take: 15,
      include: { cliente: true },
    }),
    prisma.premio.findMany(),
  ]);

  const premiosPorId = new Map(premios.map((p) => [p.id, p]));

  if (transacciones.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Todavía no hay canjes ni ajustes.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {transacciones.map((t) => (
        <li
          key={t.id}
          className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm"
        >
          <span>
            <strong>{t.cliente.nombre}</strong>{" "}
            {t.tipo === "CANJE"
              ? `canjeó ${premiosPorId.get(t.referenciaId)?.nombre ?? "premio eliminado"}`
              : `ajuste manual: ${t.puntos >= 0 ? "+" : ""}${t.puntos} pts (${t.nota})`}
          </span>
          <span className="shrink-0 text-stone-500">
            {new Date(t.fecha).toLocaleString("es-AR")}
          </span>
        </li>
      ))}
    </ul>
  );
}
