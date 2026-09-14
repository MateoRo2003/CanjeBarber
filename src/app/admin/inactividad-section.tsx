import { prisma } from "@/lib/prisma";
import { BotonSubmit } from "@/components/boton-submit";
import { guardarConfigInactividad } from "./actions";
import { EjecutarInactividadBoton } from "./ejecutar-inactividad-boton";

// Fila única de Configuracion (id fijo "config") — findUnique devuelve
// null hasta que el admin guarda por primera vez; los defaults del
// schema (30 días, 0 puntos, las 3 condiciones activadas) cubren ese caso.
export async function InactividadSection() {
  const config = await prisma.configuracion.findUnique({
    where: { id: "config" },
  });

  return (
    // Dos <form> hermanos (no uno anidado dentro del otro, que es HTML
    // inválido): guardar la config es una acción, "ejecutar ahora" es
    // otra — por eso EjecutarInactividadBoton queda afuera de este form.
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
      <form
        action={guardarConfigInactividad}
        className="flex flex-col gap-4"
      >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Descuento por inactividad
          </p>
          <p className="text-xs text-muted-soft">
            Le descuenta puntos a un cliente que lleva mucho tiempo sin
            actividad. Es progresivo: si sigue sin volver, se le vuelve a
            descontar cada vez que pasa otro período igual.
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={config?.inactividadActiva ?? false}
            className="h-4 w-4 rounded border-border-strong"
          />
          Activo
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label className="text-xs text-muted-soft">
            Días sin actividad
          </label>
          <input
            name="dias"
            type="number"
            min={1}
            defaultValue={config?.inactividadDias ?? 30}
            className="w-28 rounded-lg border border-border-strong px-3 py-2 text-sm transition hover:border-reseda focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-muted-soft">
            Puntos a descontar
          </label>
          <input
            name="puntos"
            type="number"
            min={0}
            defaultValue={config?.inactividadPuntos ?? 0}
            className="w-28 rounded-lg border border-border-strong px-3 py-2 text-sm transition hover:border-reseda focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-soft">
          Cuenta como &ldquo;sigue activo&rdquo; si, dentro del período, el
          cliente…
        </p>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-4">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="consideraLogin"
              defaultChecked={config?.inactividadConsideraLogin ?? true}
              className="h-4 w-4 rounded border-border-strong"
            />
            Inicia sesión
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="consideraCanje"
              defaultChecked={config?.inactividadConsideraCanje ?? true}
              className="h-4 w-4 rounded border-border-strong"
            />
            Canjea un premio
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="consideraSuma"
              defaultChecked={config?.inactividadConsideraSuma ?? true}
              className="h-4 w-4 rounded border-border-strong"
            />
            Suma puntos (usa un beneficio)
          </label>
        </div>
      </div>

        <BotonSubmit
          pendingText="Guardando…"
          className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
        >
          Guardar
        </BotonSubmit>
      </form>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <p className="text-xs text-muted-soft">
          Prueba la configuración guardada ahora mismo, sin esperar a la
          revisión diaria automática.
        </p>
        <EjecutarInactividadBoton />
      </div>
    </div>
  );
}
