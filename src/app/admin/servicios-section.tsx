import { prisma } from "@/lib/prisma";
import { ServicioRow } from "./servicio-row";

export async function ServiciosSection() {
  const servicios = await prisma.servicio.findMany({
    orderBy: { creadoEn: "desc" },
  });

  if (servicios.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted-soft">
        Todavía no cargaste ningún servicio.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {servicios.map((s) => (
        <ServicioRow key={s.id} servicio={s} />
      ))}
    </ul>
  );
}
