import { createClient } from "@supabase/supabase-js";
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import WebSocket from "ws";

// Canal de Supabase Realtime (Broadcast) para avisar en vivo al panel de
// admin cuando un cliente canjea o suma puntos escaneando un QR. Solo
// funciona si el admin tiene /admin abierto en ese momento (no es una
// notificación push real, es un aviso en vivo dentro de la página) — se
// eligió así porque las notificaciones push de verdad necesitan un
// service worker + permisos del navegador y, en iPhone, "instalar" el
// panel como app desde Safari.
const CANAL = "admin-actividad";

export type AvisoActividad = {
  tipo: "CANJE" | "SUMA";
  clienteNombre: string;
  detalle: string;
  puntos: number;
};

export async function avisarActividad(payload: AvisoActividad) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Si no está configurado, no rompemos el flujo de puntos por esto —
  // es un aviso adicional, no la operación crítica.
  if (!url || !key) return;

  try {
    // Node.js (server actions) no trae WebSocket nativo antes de la v22,
    // así que hay que pasarle una implementación (paquete `ws`). En el
    // navegador no hace falta — ahí WebSocket ya es nativo.
    const supabase = createClient(url, key, {
      realtime: { transport: WebSocket as unknown as WebSocketLikeConstructor },
    });
    const canal = supabase.channel(CANAL);

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("timeout")), 4000);
      canal.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timeout);
          resolve();
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          clearTimeout(timeout);
          reject(new Error(status));
        }
      });
    });

    await canal.send({ type: "broadcast", event: "actividad", payload });
    await supabase.removeChannel(canal);
  } catch (error) {
    // Un fallo acá (ej: Realtime caído, credenciales mal puestas) no
    // debería tumbar el canje/suma real, que ya se procesó en la DB.
    console.error("No se pudo avisar al panel en vivo:", error);
  }
}
