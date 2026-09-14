import { prisma } from "@/lib/prisma";
import { BotonSubmit } from "@/components/boton-submit";
import { sumarPuntos } from "./actions";

export async function ClientesSection({ query }: { query: string }) {
  const [clientes, servicios] = await Promise.all([
    prisma.cliente.findMany({
      where: query
        ? {
            OR: [
              { nombre: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { telefono: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { fechaRegistro: "desc" },
      take: 10,
    }),
    prisma.servicio.findMany({ where: { activo: true }, orderBy: { creadoEn: "desc" } }),
  ]);

  return (
    <>
      {!query && (
        <p className="text-xs text-muted-soft">
          Mostrando los clientes registrados más recientes.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {clientes.length === 0 && (
          <p className="text-sm text-muted-soft">Sin resultados.</p>
        )}
        {clientes.map((cliente) => (
          <li
            key={cliente.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">
                {cliente.nombre}{" "}
                {!cliente.activo && (
                  <span className="rounded-full bg-danger-surface px-2 py-0.5 text-xs font-medium text-danger">
                    Deshabilitado
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-soft">
                {[cliente.email, cliente.telefono].filter(Boolean).join(" · ")}
              </p>
              <p className="text-sm text-muted-soft">
                {cliente.puntosActuales} puntos
              </p>
              <a
                href={`/admin/clientes/${cliente.id}`}
                className="text-xs text-muted-soft underline underline-offset-2 transition hover:text-foreground"
              >
                Ver ficha e historial
              </a>
            </div>
            {servicios.length > 0 ? (
              <form action={sumarPuntos} className="flex gap-2">
                <input type="hidden" name="clienteId" value={cliente.id} />
                <select
                  name="servicioId"
                  required
                  className="rounded-lg border border-border-strong px-2 py-2 text-sm transition hover:border-reseda focus:border-accent focus:outline-none"
                >
                  {servicios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} (+{s.puntosOtorgados})
                    </option>
                  ))}
                </select>
                <BotonSubmit
                  pendingText="Sumando…"
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                >
                  Sumar
                </BotonSubmit>
              </form>
            ) : (
              <p className="text-xs text-muted-faint">
                Cargá un beneficio activo para poder sumar puntos.
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
