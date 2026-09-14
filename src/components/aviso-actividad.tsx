"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Gift, PlusCircle } from "lucide-react";
import type { AvisoActividad } from "@/lib/realtime-admin";

type Toast = AvisoActividad & { id: number };

const DURACION_MS = 8000;

/**
 * Aviso en vivo para el admin: mientras esta página esté abierta (ej: un
 * celu/tablet en el mostrador), aparece un cartel apenas un cliente
 * canjea o suma puntos escaneando su QR. No es una notificación push
 * real — si el admin no tiene /admin abierto en ese momento, no le va a
 * llegar nada.
 */
export function AvisoActividad() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const supabase = createClient(url, key);
    const canal = supabase
      .channel("admin-actividad")
      .on("broadcast", { event: "actividad" }, ({ payload }) => {
        const toast = { ...(payload as AvisoActividad), id: Date.now() };
        setToasts((actuales) => [...actuales, toast]);
        setTimeout(() => {
          setToasts((actuales) => actuales.filter((t) => t.id !== toast.id));
        }, DURACION_MS);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg"
        >
          {/* Dos verdes distintos de la paleta para que canje y suma se
              distingan de un vistazo, no solo por el ícono. */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
              t.tipo === "CANJE"
                ? "bg-primary/10 text-primary"
                : "bg-accent/12 text-accent"
            }`}
          >
            {t.tipo === "CANJE" ? (
              <Gift className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <PlusCircle className="h-5 w-5" strokeWidth={1.75} />
            )}
          </div>
          <p className="text-sm text-foreground">
            <strong>{t.clienteNombre}</strong>{" "}
            {t.tipo === "CANJE" ? "canjeó" : "sumó puntos por"}{" "}
            <strong>{t.detalle}</strong>{" "}
            <span className="text-muted-soft">
              ({t.tipo === "CANJE" ? "-" : "+"}
              {t.puntos} pts)
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
