import { prisma } from "@/lib/prisma";
import { BotonSubmit } from "@/components/boton-submit";
import { guardarBonusBienvenida } from "./actions";

// Fila única de Configuracion (id fijo "config") — findUnique devuelve
// null hasta que el admin guarda por primera vez, se trata como
// "desactivado, 0 puntos".
export async function ConfiguracionSection() {
  const config = await prisma.configuracion.findUnique({
    where: { id: "config" },
  });

  return (
    <form
      action={guardarBonusBienvenida}
      className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-900">
            Bono de bienvenida
          </p>
          <p className="text-xs text-stone-500">
            Puntos automáticos para un cliente nuevo en su primer inicio de
            sesión (Google o teléfono). No se repite en logins siguientes.
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={config?.bienvenidaActiva ?? false}
            className="h-4 w-4 rounded border-stone-300"
          />
          Activo
        </label>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-stone-500">Puntos</label>
          <input
            name="puntos"
            type="number"
            min={0}
            defaultValue={config?.puntosBienvenida ?? 0}
            className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:border-stone-400 focus:border-stone-500 focus:outline-none"
          />
        </div>
        <BotonSubmit
          pendingText="Guardando…"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Guardar
        </BotonSubmit>
      </div>
    </form>
  );
}
