import { Scissors } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginConGoogle } from "@/app/actions";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect(session.user.isAdmin ? "/admin" : "/perfil");
  }

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-stone-900 text-accent-foreground">
            <Scissors className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              Puntos de la barbería
            </h1>
            <p className="max-w-xs text-balance text-stone-600">
              Sumá puntos en cada corte y canjealos por descuentos, productos
              y cortes gratis. Sin turnos, sin vueltas.
            </p>
          </div>
        </div>

        <form action={loginConGoogle} className="flex flex-col items-center gap-3">
          <button
            type="submit"
            className="flex items-center gap-3 rounded-full border border-stone-300 bg-white px-6 py-3 font-medium text-stone-800 shadow-sm transition hover:bg-stone-100 active:scale-[0.98]"
          >
            <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden>
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.6 6.5 29.1 4.5 24 4.5 12.7 4.5 3.5 13.7 3.5 25S12.7 45.5 24 45.5 44.5 36.3 44.5 25c0-1.6-.2-3.1-.9-4.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.6 6.5 29.1 4.5 24 4.5c-7.6 0-14.1 4.3-17.7 10.2z"
              />
              <path
                fill="#4CAF50"
                d="M24 45.5c5 0 9.5-1.9 12.9-5.1l-6-5c-2 1.4-4.5 2.1-6.9 2.1-5.3 0-9.7-3.5-11.3-8.3l-6.6 5.1C9.7 41 16.3 45.5 24 45.5z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.4 5.5l6 5C40.5 35.6 44.5 30.5 44.5 25c0-1.6-.2-3.1-.9-4.5z"
              />
            </svg>
            Iniciar sesión con Google
          </button>
          <p className="text-xs text-stone-400">
            Sin contraseñas. Tu cuenta de Google es tu carnet de puntos.
          </p>
        </form>
      </section>

      <footer className="px-6 pb-6 text-center text-xs text-stone-400">
        ¿Sos el barbero? Iniciá sesión con tu cuenta de administrador.
      </footer>
    </main>
  );
}
