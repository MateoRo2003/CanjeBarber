/**
 * Lista de emails de admin (el dueño de la barbería, y quien más haga
 * falta — ej: el desarrollador durante el soporte inicial). Se define
 * como ADMIN_EMAILS separados por coma en las variables de entorno,
 * ya que puede haber más de una persona con acceso al panel.
 */
export function esAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const emails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return emails.includes(email.toLowerCase());
}
