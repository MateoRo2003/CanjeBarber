# CanjeBarber — Sistema de Puntos y Fidelización

App para una barbería: los clientes suman puntos por los servicios que
consumen y los canjean por premios escaneando QRs, sin sacar turno.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Auth.js (NextAuth v5) con proveedor de Google — **callback propio**
- Prisma 7 (driver adapter `pg`) + Postgres (Supabase)
- `qrcode` para generar los QR de cada premio y el QR general del local

## Autenticación con Google — callback propio (no de Supabase)

El login se hace con Auth.js directamente contra la API OAuth de Google.
**No se usa Supabase Auth**: Supabase acá es sólo la base de datos
Postgres (vía Prisma). Esto es intencional para que, durante el login, el
usuario vea siempre el dominio propio de la barbería y nunca un dominio
`*.supabase.co`.

El callback OAuth vive dentro de esta misma app, en:

```
/api/auth/callback/google
```

(implementado en [src/app/api/auth/\[...nextauth\]/route.ts](src/app/api/auth/%5B...nextauth%5D/route.ts),
configurado en [src/auth.ts](src/auth.ts)).

### Cómo crear las credenciales de Google

1. Andá a [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Creá un **OAuth Client ID** de tipo "Web application".
3. En **Authorized redirect URIs** agregá:
   - `http://localhost:3000/api/auth/callback/google` (desarrollo)
   - `https://TU-DOMINIO.com/api/auth/callback/google` (producción, con el dominio real de la barbería)
4. Copiá el **Client ID** y el **Client secret** a `.env`:
   ```
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```
5. En producción, actualizá también `NEXTAUTH_URL` en `.env` (o la variable de entorno del hosting) al dominio real.

### Login alternativo: teléfono + contraseña (sin SMS)

Además de Google, un cliente puede entrar con un número de teléfono y una
contraseña propia (link "¿Alternativa? Registrate con tu número de
teléfono" debajo del botón de Google, en `/telefono`). **No hay
verificación por SMS**: es solo un identificador + contraseña guardados
en la propia app (con `scrypt`, ver [src/lib/password.ts](src/lib/password.ts)), pensado
como alternativa de bajo costo — no prueba que el teléfono sea
realmente de esa persona. La primera vez que alguien usa un teléfono se
le crea la cuenta sola; las siguientes veces, valida la contraseña.

Por eso el modelo `Cliente` tiene `email`/`googleId` y
`telefono`/`passwordHash` opcionales — un cliente tiene uno de los dos
métodos (o, a futuro, ambos si se suma "vincular cuenta"). Toda la app
identifica al usuario logueado por `session.user.clienteId` (no por
email), justamente porque un cliente por teléfono no tiene email.

## Variables de entorno

Ver [.env](.env) (no se commitea). Claves relevantes:

- `DATABASE_URL` / `DIRECT_URL`: conexión a Postgres de Supabase (pooler transacción / sesión).
- `NEXTAUTH_URL`: dominio propio de la app.
- `AUTH_SECRET`: secreto para firmar las cookies de sesión.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: credenciales OAuth de Google.
- `ADMIN_EMAILS`: emails de Google (separados por coma) con acceso al panel de admin — ej: el dueño de la barbería y el desarrollador. Cada uno tiene que coincidir EXACTO con el email real de esa cuenta de Google.

## Desarrollo

```bash
npm install
npx prisma migrate dev   # aplica el esquema a la base
npm run dev
```

## Modelo de datos

`Cliente`, `Servicio`, `Premio`, `Transaccion` — ver [prisma/schema.prisma](prisma/schema.prisma).

## Rutas

- `/` — landing + login con Google.
- `/telefono` — login/registro alternativo con teléfono + contraseña.
- `/perfil` — puntos del cliente + catálogo de premios.
- `/canjear/[id]` — canje de un premio (a donde apunta su QR impreso).
- `/sumar/[id]` — el cliente suma los puntos de un servicio escaneando su
  QR (impreso en el mostrador, junto a los QR de premios). Límite de una
  vez por día por cliente+servicio para que no se pueda re-escanear una
  foto del QR desde casa — el control real sigue siendo que el QR esté
  físicamente en el mostrador, igual que los de premios.
- `/admin` — panel del admin: buscador de clientes, sumar puntos, actividad reciente (canjes + ajustes), gestión de servicios y premios, QRs.
- `/admin/clientes/[id]` — ficha de un cliente: historial completo de transacciones y ajuste manual de puntos (+/-, con motivo).
- `/admin/reportes` — KPIs de uso (clientes, puntos en circulación, altas recientes, clientes sin actividad) y ranking de servicios/premios más usados.
