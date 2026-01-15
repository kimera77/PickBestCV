# PickBestCV - Análisis Inteligente de CVs con IA

Aplicación Next.js para análisis automatizado de currículums utilizando IA de Google Gemini y Firebase.

<img src="evi1.png" width="30%"> <img src="evi2.png" width="70%">

## 🚀 Características

- **Análisis de CVs con IA**: Utiliza Google Gemini para evaluar candidatos automáticamente
- **Gestión de Plantillas**: Crea y gestiona plantillas de ofertas de trabajo
- **Autenticación segura**: Firebase Authentication con protección de rutas
- **Análisis en lote**: Evalúa múltiples CVs simultáneamente
- **Puntuación automática**: Ranking de candidatos basado en coincidencia con requisitos

## 📋 Prerequisitos

- Node.js 20 o superior
- Cuenta de Firebase con proyecto configurado
- API Key de Google Cloud para Gemini

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd PickBestCV
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Copia el archivo `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Rellena las variables en `.env.local` con tus credenciales de Firebase:

   ```env
   # Firebase Client (Público - seguro para el cliente)
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
   NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

   # Firebase Admin SDK (Privado - NUNCA exponer al cliente)
   FIREBASE_SERVICE_ACCOUNT_TYPE=service_account
   FIREBASE_PROJECT_ID=tu-project-id
   FIREBASE_PRIVATE_KEY_ID=tu-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu-private-key-aqui\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=tu-client-id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/tu-service-account
   FIREBASE_UNIVERSE_DOMAIN=googleapis.com
   ```

   **⚠️ Importante**: Nunca comitees el archivo `.env.local` al repositorio.

4. **Configurar Firestore Rules**
   
   Las reglas de seguridad están en `firestore.rules`. Despliégalas con:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 🏃‍♂️ Desarrollo

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🏗️ Arquitectura

```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   └── dashboard/         # Dashboard protegido
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── dashboard/        # Componentes del dashboard
├── lib/                  # Lógica de negocio
│   ├── actions.ts        # Server Actions
│   ├── auth/             # Autenticación
│   ├── db/               # Base de datos
│   ├── errors/           # Manejo de errores
│   └── react-query/      # Configuración React Query
├── firebase/             # Configuración Firebase
│   ├── client/           # Firebase client-side
│   └── server/           # Firebase Admin SDK
├── ai/                   # Flujos de Genkit AI
└── middleware.ts         # Protección de rutas
```

## 🔒 Seguridad

- ✅ Credenciales en variables de entorno
- ✅ Middleware de autenticación en rutas protegidas
- ✅ Validación de autorización en server actions
- ✅ Firestore rules para protección de datos
- ✅ Session cookies para autenticación del servidor

## 🚀 Deployment

### Vercel

```bash
vercel --prod
```

Asegúrate de configurar todas las variables de entorno en el panel de Vercel.

### Firebase Hosting

```bash
npm run build
firebase deploy
```

## 📚 Stack Tecnológico

- **Framework**: Next.js 15.3.8
- **Lenguaje**: TypeScript
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Authentication
- **IA**: Google Gemini (vía Genkit)
- **Estado**: React Query (@tanstack/react-query)
- **UI**: shadcn/ui + Tailwind CSS
- **Validación**: Zod

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

[MIT](LICENSE)

## 📧 Contacto

Para dudas o consultas: quimserra7@gmail.com

---

**Última actualización**: 14 de enero de 2026
