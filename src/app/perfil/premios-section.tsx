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
      <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted-soft">
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
            className={`flex items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-3 shadow-sm transition ${
              // El premio que ya puede canjear se destaca del resto.
              alcanza
                ? "border-accent/35 shadow-fern/10"
                : "border-border hover:border-border-strong"
            }`}
          >
            <div>
              <p className="font-medium text-foreground">{premio.nombre}</p>
              <p className="text-sm text-muted-soft">
                {premio.puntosCosto} puntos
                {!alcanza && (
                  <span className="text-muted-faint">
                    {" "}
                    · te faltan {premio.puntosCosto - puntosActuales}
                  </span>
                )}
              </p>
            </div>
            <Link
              href={`/canjear/${premio.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition active:scale-[0.97] ${
                alcanza
                  ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                  : "bg-surface-muted text-muted hover:bg-border"
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
