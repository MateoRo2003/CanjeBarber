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
        <label htmlFor="telefono" className="text-xs text-stone-500">
          Número de teléfono
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          autoComplete="tel"
          required
          placeholder="11 1234-5678"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:border-stone-400 focus:border-stone-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="password" className="text-xs text-stone-500">
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
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm transition hover:border-stone-400 focus:border-stone-500 focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <BotonSubmit
        pendingText="Ingresando…"
        className="w-full rounded-full bg-stone-900 px-6 py-3 font-medium text-white transition hover:bg-stone-700 active:scale-[0.98]"
      >
        Continuar
      </BotonSubmit>

      <p className="text-xs text-stone-400">
        Si es la primera vez, se crea tu cuenta con estos datos. Guardá bien
        tu contraseña: no hay forma de recuperarla si te la olvidás.
      </p>
    </form>
  );
}
