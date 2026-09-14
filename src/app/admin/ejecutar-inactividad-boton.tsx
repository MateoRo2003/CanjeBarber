"use client";

import { useActionState } from "react";
import { BotonSubmit } from "@/components/boton-submit";
import { ejecutarPenalizacionInactividadAhora } from "./actions";

type Estado = { mensaje?: string; error?: string };

async function ejecutar(_previo: Estado, _formData: FormData): Promise<Estado> {
  try {
    const r = await ejecutarPenalizacionInactividadAhora();
    if (r.evaluados === 0) {
      return {
        mensaje: "No hay clientes activos con puntos para evaluar.",
      };
    }
    if (r.penalizados === 0) {
      return {
        mensaje: `Se revisaron ${r.evaluados} clientes: ninguno está inactivo todavía.`,
      };
    }
    return {
      mensaje: `Se descontaron puntos a ${r.penalizados} de ${r.evaluados} clientes revisados · -${r.puntosDescontados} puntos en total.`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "No se pudo ejecutar la revisión.",
    };
  }
}

/**
 * Corre la misma revisión que el cron diario (ver
 * src/app/api/cron/inactividad/route.ts), pero al toque — para probar la
 * configuración antes de confiar en que el cron la corra solo.
 */
export function EjecutarInactividadBoton() {
  const [estado, formAction] = useActionState(ejecutar, {});

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <BotonSubmit
        pendingText="Revisando…"
        className="self-start rounded-lg border border-border-strong px-4 py-2 text-sm font-medium text-muted transition hover:bg-surface-muted"
      >
        Ejecutar revisión ahora
      </BotonSubmit>
      {estado.mensaje && (
        <p className="text-xs text-muted-soft">{estado.mensaje}</p>
      )}
      {estado.error && (
        <p className="text-xs text-danger" role="alert">
          {estado.error}
        </p>
      )}
    </form>
  );
}
