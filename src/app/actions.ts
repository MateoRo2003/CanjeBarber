"use server";

import { signIn, signOut } from "@/auth";
import { rutaSegura } from "@/lib/safe-path";

export async function loginConGoogle(formData: FormData) {
  // Si el login se disparó desde un QR (ej: /canjear/x o /sumar/x) que
  // rebotó acá por no estar logueado, volvemos DIRECTO a esa página en
  // vez de mandar siempre a /perfil o /admin — si no, el cliente escanea,
  // se loguea, y tiene que volver a escanear el QR para que se aplique.
  const callbackUrl = rutaSegura(String(formData.get("callbackUrl") ?? ""));
  await signIn("google", { redirectTo: callbackUrl ?? "/redirigiendo" });
}

export async function cerrarSesion() {
  await signOut({ redirectTo: "/" });
}
