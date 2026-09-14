"use client";

import { useActionState } from "react";
import { BotonSubmit } from "@/components/boton-submit";
import { loginConTelefono, type TelefonoState } from "./actions";

const estadoInicial: TelefonoState = {};

export function TelefonoForm({ callbackUrl }: { callbackUrl: string | null }) {
  const [state, formAction] = useActionState(loginConTelefono, estadoInicial);

  return (
    <form action={formAction} className="flex w-full max-w-xs flex-col gap-3">
      {callbackUrl && (
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
      )}

      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="nombre" className="text-xs text-muted-soft">
          Nombre y apellido
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          required
          placeholder="Tu nombre completo"
          className="rounded-lg border border-border-strong px-3 py-2 text-sm transition hover:border-reseda focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="telefono" className="text-xs text-muted-soft">
          Número de teléfono
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          autoComplete="tel"
          required
          placeholder="11 1234-5678"
          className="rounded-lg border border-border-strong px-3 py-2 text-sm transition hover:border-reseda focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="password" className="text-xs text-muted-soft">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={4}
          placeholder="Al menos 4 caracteres"
          className="rounded-lg border border-border-strong px-3 py-2 text-sm transition hover:border-reseda focus:border-accent focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}

      <BotonSubmit
        pendingText="Ingresando…"
        className="w-full rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:bg-primary-hover active:scale-[0.98]"
      >
        Continuar
      </BotonSubmit>

      <p className="text-xs text-muted-faint">
        Si es la primera vez, se crea tu cuenta con estos datos. Guardá bien
        tu teléfono y tu contraseña: no hay forma de recuperarla si te la
        olvidás.
      </p>
    </form>
  );
}
