import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// Hash con scrypt (nativo de Node, sin dependencias nuevas). No es para
// nada tan crítico como una cuenta bancaria: es el login alternativo por
// teléfono, pensado como conveniencia, no como reemplazo serio de Google.
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const hashGuardado = Buffer.from(hash, "hex");
  const hashIngresado = scryptSync(password, salt, 64);
  if (hashGuardado.length !== hashIngresado.length) return false;

  return timingSafeEqual(hashGuardado, hashIngresado);
}
