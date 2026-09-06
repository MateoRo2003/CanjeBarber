"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { rutaSegura } from "@/lib/safe-path";

export type TelefonoState = { error?: string };

export async function loginConTelefono(
  _prevState: TelefonoState,
  formData: FormData,
): Promise<TelefonoState> {
  const telefono = String(formData.get("telefono") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = rutaSegura(String(formData.get("callbackUrl") ?? ""));

  if (!telefono) {
    return { error: "Ingresá tu número de teléfono." };
  }
  if (password.length < 4) {
    return { error: "La contraseña tiene que tener al menos 4 caracteres." };
  }

  try {
    await signIn("telefono", {
      telefono,
      password,
      redirectTo: callbackUrl ?? "/redirigiendo",
    });
  } catch (error) {
    // signIn() hace un redirect() internamente cuando sale bien, que
    // también se implementa "tirando" un error especial de Next — hay
    // que dejar pasar cualquier cosa que no sea un error de Auth.js.
    if (error instanceof AuthError) {
      return { error: "Teléfono o contraseña incorrectos." };
    }
    throw error;
  }

  return {};
}
