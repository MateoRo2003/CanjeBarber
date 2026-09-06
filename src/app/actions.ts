"use server";

import { signIn, signOut } from "@/auth";

export async function loginConGoogle() {
  // El redirectTo apunta a una ruta propia; ésta a su vez decide si el
  // usuario es admin o cliente y lo manda a /admin o /perfil.
  await signIn("google", { redirectTo: "/redirigiendo" });
}

export async function cerrarSesion() {
  await signOut({ redirectTo: "/" });
}
