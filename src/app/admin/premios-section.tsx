import { prisma } from "@/lib/prisma";
import { PremioRow } from "./premio-row";

export async function PremiosSection() {
  const premios = await prisma.premio.findMany({
    orderBy: { creadoEn: "desc" },
  });

  if (premios.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted-soft">
        Todavía no cargaste ningún premio.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {premios.map((p) => (
        <PremioRow key={p.id} premio={p} />
      ))}
    </ul>
  );
}
