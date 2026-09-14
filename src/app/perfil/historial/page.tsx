import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
        className="text-sm text-stone-500 underline underline-offset-2 transition hover:text-stone-700"
      >
        ← Volver
      </a>

      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-stone-900">Tu historial</h1>
        <p className="text-sm text-stone-500">
          Todo lo que sumaste, te dieron y canjeaste hasta ahora.
        </p>
      </header>

      {transacciones.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500">
          Todavía no tenés movimientos. Sumá puntos en tu próxima visita.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {transacciones.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p className="text-sm font-medium text-stone-900">
                  {t.tipo === "SUMA" &&
                    `Sumaste puntos · ${nombresPorId.get(t.referenciaId) ?? "servicio"}`}
                  {t.tipo === "CANJE" &&
                    `Canjeaste · ${nombresPorId.get(t.referenciaId) ?? "premio"}`}
                  {t.tipo === "BONUS" && "Bono de bienvenida"}
                  {t.tipo === "AJUSTE" &&
                    (t.nota ? `Ajuste: ${t.nota}` : "Ajuste de puntos")}
                </p>
                <p className="text-xs text-stone-400">
                  {new Date(t.fecha).toLocaleString("es-AR")}
                </p>
              </div>
              <span
                className={`shrink-0 font-semibold tabular-nums ${
                  t.puntos >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                {t.puntos >= 0 ? "+" : ""}
                {t.puntos}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
