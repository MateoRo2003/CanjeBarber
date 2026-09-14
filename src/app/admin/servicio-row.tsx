"use client";

import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { BotonSubmit } from "@/components/boton-submit";
import type { Servicio } from "@/generated/prisma/client";
import { editarServicio, eliminarServicio, toggleServicio } from "./actions";

export function ServicioRow({ servicio }: { servicio: Servicio }) {
  const [modo, setModo] = useState<"ver" | "editar" | "eliminar">("ver");

  if (modo === "editar") {
    return (
      <li className="rounded-lg border border-border-strong bg-surface p-3">
        <form
          action={async (formData) => {
            await editarServicio(formData);
            setModo("ver");
          }}
          className="flex flex-wrap items-end gap-2"
        >
          <input type="hidden" name="id" value={servicio.id} />
          <div className="flex flex-col">
            <label className="text-xs text-muted-soft">Nombre</label>
            <input
              name="nombre"
              defaultValue={servicio.nombre}
              required
              className="rounded-lg border border-border-strong px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-soft">Puntos</label>
            <input
              name="puntosOtorgados"
              type="number"
              min={1}
              defaultValue={servicio.puntosOtorgados}
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
          ¿Eliminar <strong>{servicio.nombre}</strong>? No se puede deshacer.
        </span>
        <div className="flex items-center gap-2">
          <form action={eliminarServicio}>
            <input type="hidden" name="id" value={servicio.id} />
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
          {servicio.nombre} · {servicio.puntosOtorgados} pts{" "}
          {!servicio.activo && (
            <span className="text-muted-faint">(inactivo)</span>
          )}
        </span>
        <div className="flex items-center gap-1">
          <form action={toggleServicio}>
            <input type="hidden" name="id" value={servicio.id} />
            <BotonSubmit
              pendingText="…"
              className="rounded-lg px-2 py-1.5 text-xs text-muted underline underline-offset-2 transition hover:bg-surface-muted"
            >
              {servicio.activo ? "Desactivar" : "Activar"}
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
        href={`/admin/servicios/${servicio.id}/qr`}
        className="text-xs text-muted-soft underline underline-offset-2 transition hover:text-foreground"
      >
        Ver / imprimir QR para sumar puntos (/sumar/{servicio.id})
      </a>
    </li>
  );
}
