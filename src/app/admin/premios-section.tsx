import { prisma } from "@/lib/prisma";
import { PremioRow } from "./premio-row";

export async function PremiosSection() {
  const premios = await prisma.premio.findMany({
    orderBy: { creadoEn: "desc" },
  });

  if (premios.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500">
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
