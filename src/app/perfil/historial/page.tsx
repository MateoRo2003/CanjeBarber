import {
  Gift,
  Moon,
  PlusCircle,
  SlidersHorizontal,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { TipoTransaccion } from "@/generated/prisma/enums";

// Cada tipo de movimiento con su ícono y su verde de la paleta, para que
// el historial se lea de un vistazo sin tener que leer texto.
const ESTILO_MOVIMIENTO: Record<
  TipoTransaccion,
  { icono: LucideIcon; clase: string }
> = {
  SUMA: { icono: PlusCircle, clase: "bg-accent/12 text-accent" },
  CANJE: { icono: Gift, clase: "bg-primary/10 text-primary" },
  BONUS: { icono: Sparkles, clase: "bg-reseda/20 text-moss" },
  AJUSTE: { icono: SlidersHorizontal, clase: "bg-surface-muted text-muted" },
  PENALIZACION: { icono: Moon, clase: "bg-danger-surface text-danger" },
};

// Etiquetas en primera persona (vos) para lo que ve el cliente final —
// distinto del historial de /admin/clientes/[id], que habla del cliente
// en tercera persona para el barbero.
export default async function HistorialPage() {
  const session = await auth();
  if (!session?.user?.clienteId) redirect("/");
  if (session.user.isAdmin) redirect("/admin");

  const cliente = await prisma.cliente.findUnique({
    where: { id: session.user.clienteId },
  });
  // Cuenta deshabilitada o eliminada: /perfil ya sabe mostrar el mensaje
  // correspondiente para cada caso, así que no se duplica acá.
  if (!cliente || !cliente.activo) redirect("/perfil");

  const [transacciones, servicios, premios] = await Promise.all([
    prisma.transaccion.findMany({
      where: { clienteId: cliente.id },
      orderBy: { fecha: "desc" },
    }),
    prisma.servicio.findMany(),
    prisma.premio.findMany(),
  ]);

  const nombresPorId = new Map<string, string>([
    ...servicios.map((s) => [s.id, s.nombre] as const),
    ...premios.map((p) => [p.id, p.nombre] as const),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
      <a
        href="/perfil"
        className="text-sm text-muted-soft underline underline-offset-2 transition hover:text-foreground"
      >
        ← Volver
      </a>

      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">Tu historial</h1>
        <p className="text-sm text-muted-soft">
          Todo lo que sumaste, te dieron, canjeaste o te descontaron hasta
          ahora.
        </p>
      </header>

      {transacciones.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-sm text-muted-soft">
          Todavía no tenés movimientos. Sumá puntos en tu próxima visita.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {transacciones.map((t) => {
            const { icono: Icono, clase } = ESTILO_MOVIMIENTO[t.tipo];
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${clase}`}
                >
                  <Icono className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {t.tipo === "SUMA" &&
                      `Sumaste puntos · ${nombresPorId.get(t.referenciaId) ?? "beneficio"}`}
                    {t.tipo === "CANJE" &&
                      `Canjeaste · ${nombresPorId.get(t.referenciaId) ?? "premio"}`}
                    {t.tipo === "BONUS" && "Bono de bienvenida"}
                    {t.tipo === "AJUSTE" &&
                      (t.nota ? `Ajuste: ${t.nota}` : "Ajuste de puntos")}
                    {t.tipo === "PENALIZACION" &&
                      `Descuento por inactividad${t.nota ? ` · ${t.nota}` : ""}`}
                  </p>
                  <p className="text-xs text-muted-faint">
                    {new Date(t.fecha).toLocaleString("es-AR")}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-semibold tabular-nums ${
                    t.puntos >= 0 ? "text-accent" : "text-danger"
                  }`}
                >
                  {t.puntos >= 0 ? "+" : ""}
                  {t.puntos}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
