import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cerrarSesion } from "@/app/actions";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/");
  if (session.user.isAdmin) redirect("/admin");

  const cliente = await prisma.cliente.findUnique({
    where: { email: session.user.email },
  });
  if (!cliente) redirect("/");

  const premios = await prisma.premio.findMany({
    where: { activo: true },
    orderBy: { puntosCosto: "asc" },
  });

  const proximoPremio = premios.find(
    (p) => p.puntosCosto > cliente.puntosActuales,
  );

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">Hola,</p>
          <h1 className="text-xl font-bold text-stone-900">
            {cliente.nombre}
          </h1>
        </div>
        <form action={cerrarSesion}>
          <button className="text-sm text-stone-400 underline underline-offset-2 hover:text-stone-600">
            Cerrar sesión
          </button>
        </form>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl bg-stone-900 px-6 py-8 text-center text-white">
        <p className="text-sm tracking-wide text-stone-400 uppercase">
          Tus puntos
        </p>
        <p className="text-6xl font-bold tabular-nums text-accent-foreground">
          {cliente.puntosActuales}
        </p>
        {proximoPremio && (
          <p className="text-sm text-stone-300">
            Te faltan{" "}
            <span className="font-semibold text-accent-foreground">
              {proximoPremio.puntosCosto - cliente.puntosActuales}
            </span>{" "}
            puntos para &ldquo;{proximoPremio.nombre}&rdquo;
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-stone-900">Premios disponibles</h2>
        {premios.length === 0 && (
          <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500">
            Todavía no hay premios cargados. Volvé a mirar más adelante.
          </p>
        )}
        <ul className="flex flex-col gap-3">
          {premios.map((premio) => {
            const alcanza = cliente.puntosActuales >= premio.puntosCosto;
            return (
              <li
                key={premio.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {premio.nombre}
                  </p>
                  <p className="text-sm text-stone-500">
                    {premio.puntosCosto} puntos
                  </p>
                </div>
                <Link
                  href={`/canjear/${premio.id}`}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                    alcanza
                      ? "bg-accent text-accent-foreground hover:opacity-90"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {alcanza ? "Canjear" : "Ver"}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
