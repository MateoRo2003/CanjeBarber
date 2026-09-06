import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

// IMPORTANTE: acá NO se usa Supabase Auth. El login con Google lo maneja
// Auth.js directamente contra la API de Google, y el callback OAuth vive
// dentro de esta misma app en /api/auth/callback/google — es decir, con
// dominio propio (el de la barbería), nunca el dominio *.supabase.co.
// Supabase acá es solo la base de datos Postgres (vía Prisma).
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // Sesión como JWT firmado en una cookie propia (no requiere adapter de
  // base de datos para la autenticación en sí): más simple, ya que acá
  // hay un solo rol especial (admin) resuelto por email, no un sistema
  // de cuentas/roles complejo.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    // Al loguearse, creamos (o encontramos) el registro de Cliente en
    // nuestra propia tabla `clientes`, con 0 puntos si es la primera vez.
    async signIn({ user, account }) {
      if (!user.email || !account?.providerAccountId) return false;

      await prisma.cliente.upsert({
        where: { email: user.email },
        update: { nombre: user.name ?? "" },
        create: {
          nombre: user.name ?? "",
          email: user.email,
          googleId: account.providerAccountId,
        },
      });

      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        token.isAdmin =
          token.email.toLowerCase() ===
          process.env.ADMIN_EMAIL?.toLowerCase();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
});
