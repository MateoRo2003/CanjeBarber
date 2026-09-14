"use client";

import { useState } from "react";
import { BotonSubmit } from "@/components/boton-submit";
import { eliminarCliente } from "../../actions";

export function EliminarCliente({
  clienteId,
  clienteNombre,
}: {
  clienteId: string;
  clienteNombre: string;
}) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="rounded-lg border border-danger-border px-4 py-2 text-sm font-medium text-danger transition hover:bg-danger-surface"
      >
        Eliminar cliente
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-danger-border bg-danger-surface p-3">
      <p className="text-sm text-danger">
        ¿Eliminar a <strong>{clienteNombre}</strong> definitivamente? Se
        borra junto con todo su historial de puntos y transacciones — no se
        puede deshacer. Si solo querés que no pueda usar la app, usá
        &ldquo;Deshabilitar&rdquo; en vez de esto.
      </p>
      <div className="flex items-center gap-2">
        <form action={eliminarCliente}>
          <input type="hidden" name="id" value={clienteId} />
          <BotonSubmit
            pendingText="Eliminando…"
            className="rounded-lg bg-danger px-3 py-1.5 text-sm font-medium text-white transition hover:bg-danger-hover"
          >
            Sí, eliminar definitivamente
          </BotonSubmit>
        </form>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="rounded-lg px-3 py-1.5 text-sm text-muted transition hover:bg-surface-muted"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
