# 🏆 Plataforma de Venta de Licencias

Plataforma web completa para la venta de licencias con niveles de especialización, integración con WhatsApp, carrito de compras, pagos con Stripe y paneles separados para usuarios y administradores.

## 📋 Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Correr en Local](#correr-en-local)
- [API Endpoints](#api-endpoints)
- [Credenciales de Prueba](#credenciales-de-prueba)

---

## 🛠 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18 + Vite + TailwindCSS v3 + TypeScript |
| **Backend** | Node.js + Express + TypeScript |
| **Base de Datos** | PostgreSQL + Prisma ORM |
| **Autenticación** | JWT + bcrypt |
| **Pagos** | Stripe (modo test) |
| **WhatsApp** | Twilio API for WhatsApp |
| **Email** | Nodemailer |
| **PDF** | PDFKit |

---

## ✨ Características

### Catálogo de Licencias
- Listado organizado por grado de especialización (Básica, Intermedia, Avanzada, Experta)
- Filtros por grado y precio
- Página de detalle con competencias, beneficios, duración y requisitos

### Sistema de Usuarios
- Registro e inicio de sesión con email/contraseña
- Perfil con historial de compras y licencias adquiridas (activas/vencidas)
- Recuperación de contraseña por email

### Panel de Administración (`/admin`)
- CRUD completo de licencias y grados de especialización
- Gestión de usuarios (ver, bloquear, cambiar rol)
- Reportes de ventas y licencias próximas a vencer
- Historial de conversaciones de WhatsApp por usuario

### Proceso de Compra
- Carrito de compras
- Checkout con Stripe (modo sandbox)
- Validación de requisitos previos para licencias de nivel superior
- Generación automática de licencia en PDF con código único
- Email de confirmación con PDF adjunto

### WhatsApp
- Botón flotante "Contactar por WhatsApp" en todas las páginas
- Notificaciones automáticas de confirmación de compra
- Recordatorios de vencimiento de licencia
- Panel admin con conversaciones entrantes y respuesta desde el sistema

### Verificación de Licencias
- Código único por licencia emitida
- Página pública de verificación de autenticidad

---

## 📁 Estructura del Proyecto

```
/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Lógica de endpoints
│   │   ├── routes/            # Definición de rutas Express
│   │   ├── middleware/        # Auth, validación, error handling
│   │   ├── services/          # Stripe, PDF, Email, WhatsApp
│   │   ├── utils/             # Helpers
│   │   └── index.ts           # Entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Modelos de base de datos
│   │   └── seed.ts            # Datos iniciales
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Componentes reutilizables
│   │   ├── pages/             # Páginas de la app
│   │   │   └── admin/         # Panel de administración
│   │   ├── hooks/             # Custom hooks
│   │   ├── context/           # AuthContext, CartContext
│   │   ├── services/          # Llamadas a la API (axios)
│   │   └── types/             # TypeScript interfaces
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## 📦 Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 14 (corriendo localmente o en la nube)
- **Cuenta de Stripe** (gratuita, para obtener claves de prueba)
- **Cuenta de Twilio** (gratuita, para WhatsApp Sandbox)
- **ngrok** (para probar webhooks en local)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd licencias-platform
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ../frontend
npm install
```

### 4. Configurar variables de entorno

```bash
# Backend
cd backend
cp .env.example .env
# Edita .env con tus credenciales

# Frontend
cd ../frontend
cp .env.example .env
# Edita .env con la URL del backend
```

### 5. Configurar la base de datos

```bash
cd backend

# Crear la base de datos en PostgreSQL (si no existe)
# psql -U postgres -c "CREATE DATABASE licencias_db;"

# Ejecutar migraciones
npx prisma migrate dev --name init

# Sembrar datos iniciales
npm run seed
```

---

## 🔑 Variables de Entorno

### Backend (`backend/.env`)

```env
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/licencias_db"

# JWT
JWT_SECRET="tu-secreto-muy-seguro-aqui"
JWT_EXPIRES_IN="7d"

# Frontend URL (para CORS)
FRONTEND_URL="http://localhost:5173"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"
EMAIL_FROM="Licencias Platform <noreply@tudominio.com>"

# Twilio WhatsApp
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"  # Número sandbox de Twilio

# App
PORT=3001
NODE_ENV=development

# URL pública para webhooks (usar ngrok en local)
APP_URL="https://tu-ngrok-url.ngrok.io"
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL="http://localhost:3001/api"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
VITE_WHATSAPP_NUMBER="573001234567"  # Número de WhatsApp sin + ni espacios
```

---

## 💻 Correr en Local

### Backend

```bash
cd backend

# Modo desarrollo (con hot reload)
npm run dev

# Producción
npm run build
npm start
```

El backend corre en: `http://localhost:3001`

### Frontend

```bash
cd frontend

# Modo desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

El frontend corre en: `http://localhost:5173`

### Webhooks con ngrok (para WhatsApp y Stripe)

```bash
# En una terminal aparte
ngrok http 3001

# Copia la URL HTTPS que ngrok te da (ej: https://abc123.ngrok.io)
# Actualiza APP_URL en backend/.env
# Configura en Stripe Dashboard: https://abc123.ngrok.io/api/payments/webhook
# Configura en Twilio Sandbox: https://abc123.ngrok.io/api/webhook/whatsapp
```

---

## 🔗 API Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/forgot-password` | Solicitar reset de contraseña |
| POST | `/api/auth/reset-password` | Resetear contraseña con token |

### Licencias
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/licenses` | Listar licencias (con filtros) |
| GET | `/api/licenses/:id` | Detalle de licencia |
| POST | `/api/licenses` | Crear licencia (admin) |
| PUT | `/api/licenses/:id` | Editar licencia (admin) |
| DELETE | `/api/licenses/:id` | Eliminar licencia (admin) |

### Órdenes y Pagos
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/orders/checkout` | Iniciar checkout |
| GET | `/api/orders/me` | Órdenes del usuario |
| POST | `/api/payments/webhook` | Webhook de Stripe |

### Verificación
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/verify/:code` | Verificar autenticidad de licencia |

### Admin
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/users` | Listar usuarios |
| PUT | `/api/admin/users/:id` | Actualizar usuario |
| GET | `/api/admin/reports` | Reporte de ventas |
| GET | `/api/admin/conversations` | Conversaciones WhatsApp |

---

## 🧪 Credenciales de Prueba

Después de ejecutar `npm run seed`:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@licencias.com` | `Admin123!` |
| Usuario | `usuario@licencias.com` | `User123!` |

### Tarjeta de prueba Stripe
| Campo | Valor |
|-------|-------|
| Número | `4242 4242 4242 4242` |
| Expiración | Cualquier fecha futura |
| CVC | Cualquier 3 dígitos |
| ZIP | Cualquier 5 dígitos |

---

## 📱 Configurar WhatsApp Sandbox (Twilio)

1. Ve a [Twilio Console](https://console.twilio.com) → Messaging → Try it out → Send a WhatsApp message
2. Escanea el QR o envía el mensaje de activación al número sandbox
3. En "Sandbox Settings", configura el webhook: `https://tu-ngrok-url.ngrok.io/api/webhook/whatsapp`
4. Método: HTTP POST

---

## 🏗 Licencia

MIT © 2024 - Plataforma de Licencias
