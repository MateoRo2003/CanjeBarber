/**
 * Dominio propio de la app (nunca de Supabase, que acá no interviene en
 * el login ni en nada de esto). Se usa para armar las URLs que van
 * codificadas en los QR impresos.
 */
export function urlBase() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}
