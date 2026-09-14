import { Ban, Clock, PlusCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inicioDeHoyAR } from "@/lib/fecha";
import { BotonSubmit } from "@/components/boton-submit";
import { confirmarSuma } from "./actions";

export default async function SumarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.clienteId) {
    // El QR trae al cliente directo acá; si no está logueado, lo mandamos
    // a loguearse y que la landing lo traiga de vuelta a ESTA página
    // (si no, después del login siempre termina en /perfil y tiene que
    // volver a escanear el QR para que la suma se aplique).
    redirect(`/?callbackUrl=${encodeURIComponent(`/sumar/${id}`)}`);
  }
  if (session.user.isAdmin) redirect("/admin");

  const [cliente, servicio] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: session.user.clienteId } }),
    prisma.servicio.findUnique({ where: { id } }),
  ]);

  if (!cliente) redirect("/");
  // /perfil ya muestra el mensaje de "cuenta deshabilitada" — evita
  // duplicar ese texto acá.
  if (!cliente.activo) redirect("/perfil");

  if (!servicio || !servicio.activo) {
    return (
      <MensajeCentral icono={Ban} titulo="Beneficio no disponible">
        <p className="text-muted">
          Este beneficio no existe o ya no está activo.
        </p>
        <VolverAlPerfil />
      </MensajeCentral>
    );
  }

  const yaSumadoHoy = await prisma.transaccion.findFirst({
    where: {
      clienteId: cliente.id,
      tipo: "SUMA",
      referenciaId: servicio.id,
      fecha: { gte: inicioDeHoyAR() },
    },
  });

  if (yaSumadoHoy) {
    return (
      <MensajeCentral icono={Clock} titulo={servicio.nombre}>
        <p className="text-muted">
          Ya sumaste puntos por este beneficio hoy. Podés volver a sumar
          mañana.
        </p>
        <VolverAlPerfil />
      </MensajeCentral>
    );
  }

  const confirmar = confirmarSuma.bind(null, servicio.id);

  return (
    <MensajeCentral icono={PlusCircle} titulo="Sumar puntos">
      <p className="text-muted">
        Vas a sumar puntos por:{" "}
        <span className="font-semibold text-foreground">
          {servicio.nombre}
        </span>
      </p>
      <p className="text-sm text-muted-soft">
        +{servicio.puntosOtorgados} puntos · Tenés {cliente.puntosActuales}{" "}
        puntos
      </p>
      <form action={confirmar} className="w-full">
        <BotonSubmit
          pendingText="Sumando…"
          className="w-full rounded-full bg-accent px-6 py-3 font-medium text-accent-foreground transition hover:opacity-90 active:scale-[0.98]"
        >
          Confirmar suma
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
      className="text-sm text-muted-soft underline underline-offset-2 hover:text-foreground"
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
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-fern ring-1 ring-border">
        <Icono className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h1 className="text-2xl font-bold text-foreground">{titulo}</h1>
      {children}
    </main>
  );
}
