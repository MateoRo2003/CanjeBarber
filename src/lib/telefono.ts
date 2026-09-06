/**
 * Normaliza un número de teléfono ingresado a mano: se queda con el "+"
 * inicial (si lo puso) y los dígitos, sacando espacios/guiones, para que
 * "11 1234-5678" y "1112345678" no generen dos cuentas distintas.
 */
export function normalizarTelefono(valor: string): string {
  const limpio = valor.trim();
  const signo = limpio.startsWith("+") ? "+" : "";
  const digitos = limpio.replace(/\D/g, "");
  return signo + digitos;
}
