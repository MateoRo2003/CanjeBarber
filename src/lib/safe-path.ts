/**
 * Valida que un "volver a esta página después de loguearte" sea una ruta
 * propia (relativa, dentro de la misma app) y no algo tipo
 * "https://evil.com" o "//evil.com" colado por query string.
 */
export function rutaSegura(valor: string | null | undefined): string | null {
  if (!valor) return null;
  if (!valor.startsWith("/") || valor.startsWith("//")) return null;
  return valor;
}
