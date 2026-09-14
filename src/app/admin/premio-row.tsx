"use client";

import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { BotonSubmit } from "@/components/boton-submit";
import type { Premio } from "@/generated/prisma/client";
import { editarPremio, eliminarPremio, togglePremio } from "./actions";

export function PremioRow({ premio }: { premio: Premio }) {
  const [modo, setModo] = useState<"ver" | "editar" | "eliminar">("ver");

  if (modo === "editar") {
    return (
      <li className="rounded-lg border border-border-strong bg-surface p-3">
        <form
          action={async (formData) => {
            await editarPremio(formData);
            setModo("ver");
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <input type="hidden" name="id" value={premio.id} />
          <div className="flex flex-col">
            <label className="text-xs text-muted-soft">Nombre</label>
            <input
              name="nombre"
              defaultValue={premio.nombre}
              required
              className="rounded-lg border border-border-strong px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-soft">Puntos costo</label>
            <input
              name="puntosCosto"
              type="number"
              min={1}
              defaultValue={premio.puntosCosto}
              required
              className="w-24 rounded-lg border border-border-strong px-3 py-2 text-sm"
            />
          </div>
          <BotonSubmit
            pendingText="Guardando…"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Guardar
          </BotonSubmit>
          <button
            type="button"
            onClick={() => setModo("ver")}
            className="rounded-lg px-3 py-2 text-sm text-muted-soft transition hover:bg-surface-muted"
          >
            Cancelar
          </button>
        </form>
      </li>
    );
  }

  if (modo === "eliminar") {
    return (
      <li className="flex items-center justify-between gap-2 rounded-lg border border-danger-border bg-danger-surface px-4 py-2 text-sm">
        <span>
          ¿Eliminar <strong>{premio.nombre}</strong>? No se puede deshacer.
        </span>
        <div className="flex items-center gap-2">
          <form action={eliminarPremio}>
            <input type="hidden" name="id" value={premio.id} />
            <BotonSubmit
              pendingText="Eliminando…"
              className="rounded-lg bg-danger px-3 py-1.5 text-sm font-medium text-white transition hover:bg-danger-hover"
            >
              Sí, eliminar
            </BotonSubmit>
          </form>
          <button
            type="button"
            onClick={() => setModo("ver")}
            className="rounded-lg p-1.5 text-muted-soft transition hover:bg-surface-muted"
            aria-label="Cancelar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span>
          {premio.nombre} · {premio.puntosCosto} pts{" "}
          {!premio.activo && <span className="text-muted-faint">(inactivo)</span>}
        </span>
        <div className="flex items-center gap-1">
          <form action={togglePremio}>
            <input type="hidden" name="id" value={premio.id} />
            <BotonSubmit
              pendingText="…"
              className="rounded-lg px-2 py-1.5 text-xs text-muted underline underline-offset-2 transition hover:bg-surface-muted"
            >
              {premio.activo ? "Desactivar" : "Activar"}
            </BotonSubmit>
          </form>
          <button
            type="button"
            onClick={() => setModo("editar")}
            className="rounded-lg p-1.5 text-muted-soft transition hover:bg-surface-muted hover:text-foreground"
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setModo("eliminar")}
            className="rounded-lg p-1.5 text-muted-soft transition hover:bg-danger-surface hover:text-danger"
            aria-label="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <a
        href={`/admin/premios/${premio.id}/qr`}
        className="text-xs text-muted-soft underline underline-offset-2 transition hover:text-foreground"
      >
        Ver / imprimir QR de canje (/canjear/{premio.id})
      </a>
    </li>
  );
}
