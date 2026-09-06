import { handlers } from "@/auth";

// Esta ruta ES el callback propio del sistema:
//   /api/auth/callback/google
// vive en el dominio de la barbería (no en un subdominio de Supabase).
export const { GET, POST } = handlers;
