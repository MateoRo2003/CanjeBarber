import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { rutaSegura } from "@/lib/safe-path";
import { TelefonoForm } from "./telefono-form";

export default async function TelefonoPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const destino = rutaSegura(callbackUrl);

  if (session?.user) {
    redirect(destino ?? (session.user.isAdmin ? "/admin" : "/perfil"));
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">
          Entrar con tu teléfono
        </h1>
        <p className="max-w-xs text-balance text-sm text-muted">
          Alternativa a Google: usá tu número y una contraseña que elijas
          vos.
        </p>
      </div>

      <TelefonoForm callbackUrl={destino} />

      <Link
        href={destino ? `/?callbackUrl=${encodeURIComponent(destino)}` : "/"}
        className="text-sm text-muted-soft underline underline-offset-2 hover:text-foreground"
      >
        Volver a iniciar sesión con Google
      </Link>
    </main>
  );
}
