import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin: boolean;
      // id del Cliente en nuestra tabla `clientes` (null para el admin).
      // Es la forma canónica de identificar al usuario logueado en toda
      // la app, ya que un Cliente logueado por teléfono no tiene email.
      clienteId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
    clienteId?: string;
  }
}
