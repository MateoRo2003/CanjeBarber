import { Ban, Gift, Lock, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BotonSubmit } from "@/components/boton-submit";
import { confirmarCanje } from "./actions";

export default async function CanjearPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.email) {
    // El QR trae al cliente directo acá; si no está logueado, lo mandamos
    // a loguearse primero desde la landing.
    redirect("/");
  }
  if (session.user.isAdmin) redirect("/admin");

  const [cliente, premio] = await Promise.all([
    prisma.cliente.findUnique({ where: { email: session.user.email } }),
    prisma.premio.findUnique({ where: { id } }),
  ]);

  if (!cliente) redirect("/");

  if (!premio || !premio.activo) {
    return (
      <MensajeCentral icono={Ban} titulo="Premio no disponible">
        <p className="text-stone-600">
          Este premio no existe o ya no está activo.
        </p>
        <VolverAlPerfil />
      </MensajeCentral>
    );
  }

  const faltan = premio.puntosCosto - cliente.puntosActuales;

  if (faltan > 0) {
    return (
      <MensajeCentral icono={Lock} titulo={premio.nombre}>
        <p className="text-stone-600">
          Te faltan{" "}
          <span className="font-semibold text-stone-900">
            {faltan} puntos
          </span>{" "}
          para canjear este premio.
        </p>
        <p className="text-sm text-stone-500">
          Tenés {cliente.puntosActuales} de {premio.puntosCosto} puntos.
        </p>
        <VolverAlPerfil />
      </MensajeCentral>
    );
  }

  const confirmar = confirmarCanje.bind(null, premio.id);

  return (
    <MensajeCentral icono={Gift} titulo="Confirmar canje">
      <p className="text-stone-700">
        Vas a canjear:{" "}
        <span className="font-semibold text-stone-900">{premio.nombre}</span>
      </p>
      <p className="text-sm text-stone-500">
        Cuesta {premio.puntosCosto} puntos · Tenés{" "}
        {cliente.puntosActuales} puntos
      </p>
      <form action={confirmar} className="w-full">
        <BotonSubmit
          pendingText="Canjeando…"
          className="w-full rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition hover:opacity-90 active:scale-[0.98]"
        >
          Confirmar canje
        </BotonSubmit>
      </form>
      <VolverAlPerfil texto="Cancelar" />
    </MensajeCentral>
  );
}

function VolverAlPerfil({ texto = "Volver a mi perfil" }: { texto?: string }) {
  return (
    <Link
      href="/perfil"
      className="text-sm text-stone-500 underline underline-offset-2 hover:text-stone-700"
    >
      {texto}
    </Link>
  );
}

function MensajeCentral({
  icono: Icono,
  titulo,
  children,
}: {
  icono: LucideIcon;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-700">
        <Icono className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h1 className="text-2xl font-bold text-stone-900">{titulo}</h1>
      {children}
    </main>
  );
}
