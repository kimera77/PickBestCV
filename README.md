# PickBestCV - Análisis Inteligente de CVs con IA

Aplicación Next.js para análisis automatizado de currículums utilizando IA de Google Gemini y Firebase.

<img src="evi1.png" width="30%"> <img src="evi2.png" width="70%">

## 🚀 Características

- **Análisis inteligente con IA**: Evaluación automática de candidatos usando Google Gemini
- **Gestión de plantillas**: Crea y organiza ofertas de trabajo personalizadas
- **Análisis en lote**: Procesa múltiples CVs simultáneamente con puntuación automática
- **Extracción de texto**: Compatible con archivos PDF mediante OCR local y con IA
- **Multiidioma**: Interfaz en inglés y español con persistencia de preferencias
- **Autenticación segura**: Firebase Auth con acceso para usuarios invitados

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15.3.8** - App Router con Server Components y Server Actions
- **React 19** - Librería UI con React Query para gestión de estado
- **TypeScript** - Tipado estático end-to-end
- **Tailwind CSS** - Estilos utility-first
- **shadcn/ui** - Componentes UI accesibles y personalizables

### Backend
- **Firebase App Hosting** - Despliegue serverless en Cloud Run
- **Firebase Firestore** - Base de datos NoSQL en tiempo real
- **Firebase Authentication** - Gestión de usuarios y sesiones
- **Firebase Admin SDK** - Operaciones privilegiadas server-side

### IA y Procesamiento
- **Google Gemini AI** - Modelo de lenguaje para análisis de CVs
- **Genkit by Firebase** - Framework para flujos de IA
- **PDF.js** - Extracción de texto de documentos PDF

### Herramientas
- **Zod** - Validación de esquemas y tipos
- **React Hook Form** - Gestión de formularios
- **Lucide Icons** - Iconografía moderna

## 🏗️ Arquitectura

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, signup
│   └── dashboard/         # Dashboard protegido
├── components/
│   ├── ui/               # Componentes base shadcn/ui
│   └── dashboard/        # Componentes de negocio
├── lib/
│   ├── actions.ts        # Server Actions
│   ├── auth/             # Lógica de autenticación
│   ├── db/               # Operaciones de base de datos
│   └── translations.ts   # Sistema i18n
├── firebase/
│   ├── client/           # SDK cliente
│   └── server/           # Firebase Admin
├── ai/
│   └── flows/            # Flujos de Genkit
└── middleware.ts         # Protección de rutas
```

## 🔒 Seguridad

- Variables de entorno para credenciales sensibles
- Middleware de autenticación en rutas protegidas
- Firestore Security Rules para control de acceso a datos
- Validación de entrada con Zod en Server Actions
- Separación cliente/servidor con Firebase SDK

## 🚀 Deployment

Desplegado en **Firebase App Hosting** con integración continua desde GitHub. Las variables de entorno se gestionan como secretos en Cloud Secret Manager.

---

**Última actualización**: 16 de enero de 2026
