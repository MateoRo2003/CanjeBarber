import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { esAdminEmail } from "@/lib/admin-emails";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { normalizarTelefono } from "@/lib/telefono";

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
    // Login alternativo con teléfono + contraseña, sin SMS: es solo un
    // identificador propio de la app (no se verifica que el teléfono sea
    // realmente de esa persona). Primera vez que se usa un teléfono, se
    // crea la cuenta sola; las siguientes, valida la contraseña.
    Credentials({
      id: "telefono",
      name: "Teléfono",
      credentials: {
        nombre: { label: "Nombre y apellido", type: "text" },
        telefono: { label: "Teléfono", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const nombre = String(credentials?.nombre ?? "").trim();
        const telefono = normalizarTelefono(String(credentials?.telefono ?? ""));
        const password = String(credentials?.password ?? "");
        if (!telefono || password.length < 4) return null;

        let cliente = await prisma.cliente.findUnique({ where: { telefono } });

        if (!cliente) {
          if (!nombre) return null;
          cliente = await prisma.cliente.create({
            data: {
              nombre,
              telefono,
              passwordHash: hashPassword(password),
            },
          });
        } else if (
          !cliente.passwordHash ||
          !verifyPassword(password, cliente.passwordHash)
        ) {
          return null;
        } else if (nombre && cliente.nombre === cliente.telefono) {
          // Cuenta creada antes de pedir nombre (quedó con el teléfono
          // como "nombre" de placeholder) — se corrige sola apenas la
          // persona vuelve a loguearse con un nombre real cargado.
          cliente = await prisma.cliente.update({
            where: { id: cliente.id },
            data: { nombre },
          });
        }

        return { id: cliente.id, name: cliente.nombre };
      },
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
    // Acá se frena a un cliente deshabilitado por el admin, sea cual sea
    // el provider con el que intente entrar (Google o teléfono) — el
    // authorize() del provider ya validó la identidad, esto valida si
    // esa cuenta tiene permitido usar la app.
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        if (!esAdminEmail(user.email)) {
          const cliente = await prisma.cliente.findUnique({
            where: { email: user.email },
          });
          if (cliente && !cliente.activo) return false;
        }
      } else if (account?.provider === "telefono" && user.id) {
        const cliente = await prisma.cliente.findUnique({
          where: { id: user.id },
        });
        if (cliente && !cliente.activo) return false;
      }
      return true;
    },
    // clienteId queda grabado en el token acá, sea cual sea el provider
    // usado — así el resto de la app siempre busca al Cliente por id, en
    // vez de por email (que un cliente logueado por teléfono no tiene).
    async jwt({ token, user, account }) {
      if (user && account?.provider === "google") {
        if (esAdminEmail(user.email)) {
          token.isAdmin = true;
          token.clienteId = undefined;
        } else if (user.email) {
          const cliente = await prisma.cliente.upsert({
            where: { email: user.email },
            update: {
              nombre: user.name ?? undefined,
              googleId: account.providerAccountId,
            },
            create: {
              nombre: user.name ?? "",
              email: user.email,
              googleId: account.providerAccountId,
            },
          });
          token.clienteId = cliente.id;
          token.isAdmin = false;
        }
      } else if (user && account?.provider === "telefono") {
        token.clienteId = user.id;
        token.isAdmin = false;
      } else if (!token.isAdmin && !token.clienteId && token.email) {
        // Sesión vieja: un JWT emitido ANTES de que existiera clienteId
        // (antes de sumar el login por teléfono). Sin esto, session.user
        // queda con isAdmin=false y clienteId=null para siempre — ni
        // cliente ni admin — y /perfil ↔ / entran en loop de redirects.
        // Se autocompleta acá, en vez de forzar a cerrar sesión.
        if (esAdminEmail(token.email)) {
          token.isAdmin = true;
        } else {
          const cliente = await prisma.cliente.upsert({
            where: { email: token.email },
            update: {},
            create: { nombre: token.name ?? "", email: token.email },
          });
          token.clienteId = cliente.id;
          token.isAdmin = false;
        }
      }

      // Se valida en CADA request (no solo al loguearse): si el token
      // dice que hay un Cliente pero ya no existe (lo eliminó el admin,
      // o cualquier otra baja de la fila), la sesión queda "fantasma" —
      // isAdmin=false y clienteId apuntando a nada — y /perfil ↔ /
      // entran en el mismo loop de redirects que las sesiones viejas de
      // más arriba. Acá se corta invalidando la sesión directamente
      // (retornar null hace que auth() devuelva sesión nula).
      if (!token.isAdmin && token.clienteId) {
        const existe = await prisma.cliente.findUnique({
          where: { id: token.clienteId as string },
          select: { id: true },
        });
        if (!existe) return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.clienteId = (token.clienteId as string | undefined) ?? null;
      }
      return session;
    },
  },
});
