import Link from "next/link";
import { prisma } from "@/lib/prisma";

export async function PremiosSection({
  puntosActuales,
}: {
  puntosActuales: number;
}) {
  const premios = await prisma.premio.findMany({
    where: { activo: true },
    orderBy: { puntosCosto: "asc" },
  });

  if (premios.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500">
        Todavía no hay premios cargados. Volvé a mirar más adelante.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {premios.map((premio) => {
        const alcanza = puntosActuales >= premio.puntosCosto;
        return (
          <li
            key={premio.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="font-medium text-stone-900">{premio.nombre}</p>
              <p className="text-sm text-stone-500">
                {premio.puntosCosto} puntos
              </p>
            </div>
            <Link
              href={`/canjear/${premio.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition active:scale-[0.97] ${
                alcanza
                  ? "bg-accent text-accent-foreground hover:opacity-90"
                  : "bg-stone-100 text-stone-400 hover:bg-stone-200"
              }`}
            >
              {alcanza ? "Canjear" : "Ver"}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
