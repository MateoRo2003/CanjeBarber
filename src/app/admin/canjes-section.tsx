import { prisma } from "@/lib/prisma";

export async function CanjesSection() {
  const [canjesRecientes, premios] = await Promise.all([
    prisma.transaccion.findMany({
      where: { tipo: "CANJE" },
      orderBy: { fecha: "desc" },
      take: 15,
      include: { cliente: true },
    }),
    prisma.premio.findMany(),
  ]);

  const premiosPorId = new Map(premios.map((p) => [p.id, p]));

  if (canjesRecientes.length === 0) {
    return <p className="text-sm text-stone-500">Todavía no hay canjes.</p>;
  }

  return (
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
  );
}
