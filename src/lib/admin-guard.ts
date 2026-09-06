import { auth } from "@/auth";

/**
 * Chequeo de autorización server-side para toda acción de admin.
 * Nunca hay que confiar en que la UI oculte el botón: cada server action
 * de /admin vuelve a validar esto antes de tocar la base.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("No autorizado.");
  }
  return session;
}
