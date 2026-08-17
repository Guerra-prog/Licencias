# CEA AMC – Backend API

API REST del **Centro de Enseñanza Automovilística AMC** (Montería, Colombia), para la formación e inscripción en licencias de conducción.

## Stack

- Node.js + Express + TypeScript
- PostgreSQL (Clever Cloud) + Prisma ORM
- Cloudinary (imágenes y PDFs de certificados)
- JWT (login único con roles `admin` / `student`)
- Stripe (pagos en modo test)

## Requisitos previos

- Node.js 18+
- Una base de datos PostgreSQL (recomendado: Clever Cloud)
- Cuenta de Cloudinary
- Cuenta de Stripe (modo test)

## Instalación

```bash
cd backend
npm install
cp .env.example .env   # y completa las variables
npm run migrate        # crea las tablas (prisma migrate dev)
npm run seed           # precarga licencias, combos, servicios y admin
npm run dev            # inicia el servidor en http://localhost:3001
```

## Crear la base de datos en Clever Cloud

1. Crea una cuenta en [Clever Cloud](https://www.clever-cloud.com/) e inicia sesión en la consola.
2. En tu organización, haz clic en **Create** → **an add-on** → **PostgreSQL**.
3. Elige el plan (el plan **DEV** es gratuito y suficiente para desarrollo) y la región.
4. Asigna un nombre al add-on y créalo (no necesitas vincularlo a una aplicación).
5. Entra al add-on → pestaña **Service dependencies / Connection information** y copia la variable `POSTGRESQL_ADDON_URI`, con formato:
   ```
   postgresql://<usuario>:<contraseña>@<host>-postgresql.services.clever-cloud.com:<puerto>/<nombre_bd>
   ```
6. Pégala en tu `.env` como `DATABASE_URL`.

## Obtener credenciales de Cloudinary

1. Crea una cuenta gratuita en [Cloudinary](https://cloudinary.com/).
2. En el [Dashboard de la consola](https://console.cloudinary.com/) encontrarás:
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

## Configurar Stripe (modo test)

1. Crea una cuenta en [Stripe](https://dashboard.stripe.com/register) y activa el **modo test**.
2. Copia la clave secreta de test (`sk_test_...`) desde [API keys](https://dashboard.stripe.com/test/apikeys) → `STRIPE_SECRET_KEY`.
3. Para el webhook local usa la [CLI de Stripe](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3001/payments/webhook
   ```
   y copia el `whsec_...` que imprime → `STRIPE_WEBHOOK_SECRET`.

## Variables de entorno

Ver `.env.example`. Resumen:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Connection string de PostgreSQL (Clever Cloud) |
| `JWT_SECRET` | Secreto para firmar los JWT |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Credenciales de Cloudinary |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Claves de Stripe en modo test |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales del admin creado por el seed |
| `PORT` | Puerto del servidor (por defecto 3001) |
| `FRONTEND_URL` | URL del frontend (CORS y redirecciones de Stripe) |

## Migraciones y seed

```bash
npm run migrate          # prisma migrate dev (desarrollo)
npm run migrate:deploy   # prisma migrate deploy (producción)
npm run seed             # precarga datos (licencias A2/B1/C1/RC1/RC2, combos, servicios, admin)
```

El seed es idempotente: puede ejecutarse varias veces sin duplicar datos.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Genera el cliente de Prisma y compila TypeScript a `dist/` |
| `npm start` | Ejecuta el build compilado |
| `npm run seed` | Ejecuta `prisma/seed.ts` |
| `npm run migrate` | `prisma migrate dev` |
| `npm run typecheck` | Verificación de tipos sin compilar |

## Endpoints

### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | Pública | Registro (siempre crea `student`) |
| POST | `/auth/login` | Pública (rate limited) | Login único; el JWT incluye el `role` |
| POST | `/auth/forgot-password` | Pública | Genera token de recuperación |
| POST | `/auth/reset-password` | Pública | Restablece la contraseña con el token |
| GET | `/auth/me` | JWT | Perfil del usuario autenticado |

### Catálogo (lectura pública, escritura admin)
| Método | Ruta | Auth |
|--------|------|------|
| GET | `/licenses`, `/licenses/:id` | Pública |
| POST/PUT/DELETE | `/admin/licenses`, `/admin/licenses/:id` | Admin |
| GET | `/combos`, `/combos/:id` | Pública |
| POST/PUT/DELETE | `/admin/combos`, `/admin/combos/:id` | Admin |
| GET | `/services` | Pública |
| POST/PUT/DELETE | `/admin/services`, `/admin/services/:id` | Admin |

### Inscripciones
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/enrollments` | JWT | Crea inscripción (valida edad y licencia previa para RC1/RC2) |
| GET | `/enrollments/me` | JWT | Historial del usuario |
| GET | `/admin/enrollments?estado=` | Admin | Todas las inscripciones con filtro por estado |
| PUT | `/admin/enrollments/:id` | Admin | Cambia estado y/o emite certificado PDF (`emitirLicencia: true`) |
| GET | `/verify/:codigoVerificacion` | Pública | Verifica autenticidad de un certificado |

### Pagos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/payments/checkout` | JWT | Crea sesión de Stripe Checkout y devuelve `checkoutUrl` |
| POST | `/payments/webhook` | Firma Stripe | Confirma el pago (marca inscripción como `pagado`) |

### Usuarios (admin)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/users` | Lista usuarios |
| POST | `/admin/users` | Crea un usuario admin |
| PUT | `/admin/users/:id` | Cambia `role` o `activo` |

### Uploads
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/uploads/image` | JWT | Sube imagen a Cloudinary (multipart, campo `image`; `folder` opcional: `logo`, `licencias`, `combos`, `comprobantes`, `perfiles`). Devuelve la URL. |

## Seguridad

- Contraseñas con hash bcrypt
- Validación y sanitización de inputs con Zod
- Rate limiting en `/auth/login` (10 intentos / 15 min)
- Validación de tipo (JPEG/PNG/WebP/GIF) y tamaño (máx. 5 MB) antes de subir a Cloudinary
- Helmet + CORS restringido al frontend
