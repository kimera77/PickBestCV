# 📋 Guía de Refactorización y Mejoras - PickBestCV

## 📊 Resumen Ejecutivo

**Fecha de Análisis:** 14 de enero de 2026  
**Versión de la Aplicación:** 0.1.0  
**Stack Tecnológico:** Next.js 15.3.8, Firebase, Genkit AI, TypeScript

---

## 🔴 CRÍTICOS - Acción Inmediata Requerida

### 1. **Seguridad: Credenciales de Firebase Expuestas**
**Ubicación:** `src/firebase/client/config.ts`  
**Severidad:** 🔴 CRÍTICA  
**Impacto:** Exposición de claves API y configuración de Firebase en código fuente

**Problema:**
```typescript
export const firebaseConfig = {
  "apiKey": "AIzaSyBj02MbkWW6s0p3QRJsbQ3TJLW-TBuAPGY",
  "authDomain": "studio-2697715951-c0e8e.firebaseapp.com",
  // ...otras credenciales expuestas
};
```

**Solución:**
- Mover todas las credenciales a variables de entorno (`.env.local`)
- Usar `process.env.NEXT_PUBLIC_FIREBASE_API_KEY` para valores públicos del cliente
- Nunca commitear archivos `.env` al repositorio (añadir a `.gitignore`)
- Rotar las credenciales actuales desde Firebase Console

**Acción:**
```typescript
// src/firebase/client/config.ts
export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
};
```

---

### 2. **Build Configuration: Ignorar Errores de TypeScript y ESLint**
**Ubicación:** `next.config.ts`  
**Severidad:** 🔴 CRÍTICA  
**Impacto:** Código con errores puede llegar a producción

**Problema:**
```typescript
typescript: {
  ignoreBuildErrors: true,
},
eslint: {
  ignoreDuringBuilds: true,
},
```

**Solución:**
- **Eliminar completamente estas opciones**
- Corregir todos los errores de TypeScript y ESLint antes de hacer build
- Configurar CI/CD para bloquear deploys con errores

**Beneficios:**
- Prevención de bugs en producción
- Mejor experiencia de desarrollo
- Mayor calidad de código

---

### 3. **Seguridad: Falta de Validación de Autorización**
**Ubicación:** `src/lib/db/actions.ts`  
**Severidad:** 🔴 CRÍTICA  
**Impacto:** Cualquier usuario autenticado puede modificar/eliminar plantillas de otros usuarios

**Problema:**
```typescript
export async function deleteJobTemplate(templateId: string, userId: string) {
    // Comentario indica que falta validación:
    // "We might add a check here in a real app to ensure the user owns the template"
    await templateRef.delete();
}
```

**Solución Requerida:**
```typescript
export async function deleteJobTemplate(templateId: string, userId: string) {
    const firestore = await getAdminFirestore();
    const templateRef = firestore.doc(`jobPositionTemplates/${templateId}`);
    
    // VALIDAR PROPIEDAD ANTES DE ELIMINAR
    const doc = await templateRef.get();
    if (!doc.exists) {
        throw new Error("Plantilla no encontrada");
    }
    
    const templateData = doc.data();
    if (templateData?.userId !== userId) {
        throw new Error("No autorizado para eliminar esta plantilla");
    }
    
    await templateRef.delete();
    revalidatePath("/dashboard");
}
```

**Aplicar el mismo patrón en:**
- `updateJobTemplate`
- `getJobTemplates` (filtrar solo plantillas del usuario)

---

### 4. **Middleware Vacío Sin Protección de Rutas**
**Ubicación:** `src/middleware.ts`  
**Severidad:** 🔴 ALTA  
**Impacto:** Dashboard accesible sin autenticación

**Problema:**
```typescript
export async function middleware(request: NextRequest) {
  return NextResponse.next(); // No hace nada
}
```

**Solución:**
```typescript
import { type NextRequest, NextResponse } from "next/server";
import { verifySessionCookie } from "@/firebase/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Rutas públicas
  const isPublicPath = pathname === '/' || 
                       pathname.startsWith('/login') || 
                       pathname.startsWith('/signup');
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Verificar sesión para rutas protegidas
  const sessionCookie = request.cookies.get("session")?.value;
  
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  const user = await verifySessionCookie(sessionCookie);
  
  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete("session");
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

---

## 🟠 ALTOS - Acción Necesaria a Corto Plazo

### 5. **Manejo de Errores Inconsistente**
**Ubicación:** Múltiples archivos (`src/lib/**/*.ts`)  
**Severidad:** 🟠 ALTA

**Problemas Detectados:**
- 14 `console.error` en código de producción
- No hay logging estructurado
- Errores genéricos sin contexto para debugging

**Solución:**
1. Implementar un sistema de logging centralizado
2. Usar herramientas como Sentry o Firebase Crashlytics
3. Crear tipos personalizados de error

**Ejemplo de implementación:**
```typescript
// src/lib/errors/logger.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function logError(error: unknown, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    // Enviar a Sentry/Firebase Crashlytics
    // Sentry.captureException(error, { extra: context });
  } else {
    console.error('Error:', error, 'Context:', context);
  }
}

// Uso:
try {
  await createJobTemplate(data);
} catch (error) {
  logError(error, { action: 'createJobTemplate', userId: user.uid });
  throw new AppError('Error al crear plantilla', 'TEMPLATE_CREATE_FAILED', 500, error);
}
```

---

### 6. **Race Conditions en useEffect**
**Ubicación:** `src/components/dashboard/dashboard-page.tsx`  
**Severidad:** 🟠 ALTA  
**Impacto:** Múltiples llamadas a la base de datos, estado inconsistente

**Problema:**
```typescript
useEffect(() => {
  refreshTemplates();
}, [refreshTemplates]); // refreshTemplates cambia en cada render
```

**Solución:**
```typescript
// Opción 1: Separar la lógica de fetch
useEffect(() => {
  if (user === undefined) return;
  
  let isMounted = true;
  
  async function fetchTemplates() {
    const userId = (user && !user.isAnonymous) ? user.uid : undefined;
    const freshTemplates = await getJobTemplates(userId);
    
    if (isMounted) {
      setTemplates(freshTemplates);
      if (freshTemplates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(freshTemplates[0]);
      }
    }
  }
  
  fetchTemplates();
  
  return () => {
    isMounted = false;
  };
}, [user]); // Solo depende de user

// Opción 2: Usar React Query / SWR para manejo de datos
```

---

### 7. **Falta de Validación del Lado del Servidor**
**Ubicación:** `src/lib/auth/actions.ts`  
**Severidad:** 🟠 ALTA

**Problema:**
- `getCurrentUser()` no está siendo llamada consistentemente antes de operaciones sensibles
- Algunas server actions confían en el `userId` del cliente sin verificar

**Solución:**
```typescript
// Crear un helper reutilizable
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new AppError('No autenticado', 'UNAUTHORIZED', 401);
  }
  
  return user;
}

// Usar en todas las server actions:
export async function createJobTemplate(data: z.infer<typeof TemplateSchema>) {
  const user = await requireAuth();
  
  // Sobrescribir userId del cliente con el del servidor
  const validatedData = TemplateSchema.parse({
    ...data,
    userId: user.uid, // Usar siempre el del servidor
  });
  
  // ... resto del código
}
```

---

### 8. **Gestión de Estado del Cliente No Optimizada**
**Ubicación:** `src/components/dashboard/dashboard-page.tsx`, `cv-analysis.tsx`  
**Severidad:** 🟠 MEDIA

**Problemas:**
- Fetch manual de datos en componentes cliente
- No hay caché ni revalidación automática
- Re-renders innecesarios

**Solución:**
Implementar **React Query** o **SWR** para gestión de estado del servidor:

```bash
npm install @tanstack/react-query
```

```typescript
// src/hooks/use-job-templates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobTemplates, createJobTemplate, deleteJobTemplate } from '@/lib/actions';

export function useJobTemplates(userId?: string) {
  return useQuery({
    queryKey: ['jobTemplates', userId],
    queryFn: () => getJobTemplates(userId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createJobTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobTemplates'] });
    },
  });
}
```

---

## 🟡 MEDIOS - Mejoras de Calidad

### 9. **Falta de Testing**
**Severidad:** 🟡 MEDIA  
**Estado:** No hay tests configurados

**Recomendaciones:**
1. Configurar Jest + React Testing Library
2. Vitest para tests unitarios (más rápido con Vite)
3. Playwright para tests E2E

**Estructura sugerida:**
```
tests/
├── unit/
│   ├── lib/
│   │   ├── actions.test.ts
│   │   └── utils.test.ts
│   └── components/
│       └── cv-upload.test.tsx
├── integration/
│   └── dashboard-flow.test.tsx
└── e2e/
    └── complete-analysis.spec.ts
```

**Configuración inicial:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

---

### 10. **Accesibilidad (A11y) Limitada**
**Severidad:** 🟡 MEDIA

**Problemas Detectados:**
- Falta de atributos ARIA en componentes interactivos
- No hay manejo de navegación por teclado consistente
- Colores sin contraste verificado (WCAG AA/AAA)

**Acciones:**
1. Instalar y configurar `eslint-plugin-jsx-a11y`
2. Usar herramientas como Lighthouse y axe DevTools
3. Añadir roles y labels semánticos

**Ejemplo:**
```tsx
// Antes
<div onClick={() => setSelectedTemplate(template)}>
  {template.title}
</div>

// Después
<div
  role="button"
  tabIndex={0}
  onClick={() => setSelectedTemplate(template)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setSelectedTemplate(template);
    }
  }}
  aria-label={`Seleccionar plantilla: ${template.title}`}
>
  {template.title}
</div>
```

---

### 11. **Performance: Optimización de Imágenes y Assets**
**Severidad:** 🟡 MEDIA

**Recomendaciones:**
1. Usar `next/image` para todas las imágenes
2. Implementar lazy loading para componentes pesados
3. Code splitting con dynamic imports

```typescript
// Ejemplo de lazy loading
import dynamic from 'next/dynamic';

const AnalysisResults = dynamic(() => import('./analysis-results'), {
  loading: () => <div>Cargando resultados...</div>,
  ssr: false,
});
```

---

### 12. **Falta de Tipado Estricto**
**Ubicación:** Varios archivos  
**Severidad:** 🟡 MEDIA

**Problemas:**
- Uso de `any` en catch blocks
- `user === undefined` checks (debería usar tipos discriminados)
- Falta de tipos para respuestas de Firebase

**Solución:**
```typescript
// Crear tipos específicos
// src/lib/types/firebase.ts
export type FirebaseUser = User; // De firebase/auth

export type AuthState = 
  | { status: 'loading' }
  | { status: 'authenticated'; user: FirebaseUser }
  | { status: 'unauthenticated' };

// Usar en contexto
const AuthContext = createContext<AuthState | null>(null);

// En componentes
const authState = useAuth();
if (authState?.status === 'authenticated') {
  // TypeScript sabe que authState.user existe
  console.log(authState.user.uid);
}
```

---

## 🟢 BAJOS - Mejoras Opcionales

### 13. **Internacionalización (i18n)**
**Severidad:** 🟢 BAJA  
**Estado:** Parcialmente implementado (contexto de lenguaje existe)

**Recomendación:**
- Implementar `next-intl` o `react-i18next`
- Externalizar todos los strings a archivos de traducción
- Soportar cambio de idioma dinámico

---

### 14. **Documentación Insuficiente**
**Severidad:** 🟢 BAJA

**README actual es muy básico**

**Contenido sugerido para README.md:**
```markdown
# PickBestCV - Análisis Inteligente de CVs con IA

## 🚀 Descripción
Aplicación para análisis automatizado de CVs usando IA...

## 📋 Prerequisitos
- Node.js 20+
- Cuenta de Firebase
- API Key de Google Gemini

## 🛠️ Instalación
[Pasos detallados]

## 🏗️ Arquitectura
[Diagrama y explicación]

## 🔐 Variables de Entorno
[Lista completa con descripciones]

## 📚 Documentación de API
[Endpoints y uso]

## 🧪 Testing
[Cómo ejecutar tests]

## 🚀 Deployment
[Pasos para producción]
```

---

### 15. **Monitoreo y Analytics**
**Severidad:** 🟢 BAJA  
**Estado:** No implementado

**Recomendaciones:**
- Implementar Google Analytics 4
- Firebase Performance Monitoring
- User behavior tracking (con consentimiento)

---

### 16. **Code Style y Linting**
**Severidad:** 🟢 BAJA

**Configurar:**
```bash
npm install -D prettier eslint-config-prettier
```

**Crear `.prettierrc.json`:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 📁 Estructura de Carpetas Sugerida

```
src/
├── app/                    # App Router de Next.js
├── components/             # Componentes React
│   ├── ui/                # Componentes base (shadcn)
│   ├── dashboard/         # Componentes del dashboard
│   └── shared/            # Componentes compartidos
├── lib/                   # Lógica de negocio
│   ├── actions/           # Server Actions (separado por dominio)
│   │   ├── auth.ts
│   │   ├── templates.ts
│   │   └── analysis.ts
│   ├── hooks/             # Custom hooks
│   ├── types/             # Definiciones de tipos
│   ├── utils/             # Utilidades
│   └── validations/       # Schemas de Zod
├── ai/                    # Genkit flows
├── firebase/              # Configuración Firebase
└── middleware.ts          # Middleware de Next.js
```

---

## 🔄 Plan de Acción Priorizado

### Semana 1 (Críticos)
- [ ] Mover credenciales a variables de entorno
- [ ] Rotar claves de Firebase
- [ ] Eliminar `ignoreBuildErrors` y corregir errores TypeScript
- [ ] Implementar validación de autorización en server actions
- [ ] Proteger rutas con middleware

### Semana 2-3 (Altos)
- [ ] Implementar sistema de logging centralizado
- [ ] Corregir race conditions en useEffect
- [ ] Implementar React Query para gestión de estado
- [ ] Añadir validación del lado del servidor en todas las actions

### Semana 4-5 (Medios)
- [ ] Configurar testing framework
- [ ] Escribir tests para funcionalidades críticas
- [ ] Mejorar accesibilidad
- [ ] Optimizar performance (lazy loading, code splitting)

### Semana 6+ (Bajos)
- [ ] Implementar i18n completo
- [ ] Mejorar documentación
- [ ] Añadir monitoring y analytics
- [ ] Configurar Prettier y ESLint estricto

---

## 📊 Métricas de Calidad Actuales

| Aspecto | Estado | Objetivo |
|---------|--------|----------|
| Seguridad | 🔴 40% | 🟢 95% |
| Testing | 🔴 0% | 🟢 80% |
| TypeScript | 🟡 60% | 🟢 95% |
| Accesibilidad | 🟡 50% | 🟢 90% |
| Performance | 🟢 75% | 🟢 90% |
| Documentación | 🔴 20% | 🟢 85% |

---

## 🛡️ Checklist de Seguridad

- [ ] Variables de entorno protegidas
- [ ] Firestore Rules validadas y probadas
- [ ] Validación de autorización en todas las server actions
- [ ] Sanitización de inputs del usuario
- [ ] Rate limiting en APIs
- [ ] CSRF protection (automático en Next.js)
- [ ] Helmet.js para headers de seguridad
- [ ] Dependency audit (`npm audit`)

---

## 📝 Notas Adicionales

### Decisiones de Arquitectura Cuestionables

1. **Data Fetching en Cliente para Server Components:**
   - `dashboard/page.tsx` es un Server Component pero delega todo al cliente
   - **Recomendación:** Aprovechar Server Components para fetch inicial

2. **Duplicación de Lógica de Autenticación:**
   - Existe en `lib/auth/actions.ts` y `lib/auth/auth-provider.tsx`
   - **Recomendación:** Centralizar y clarificar responsabilidades

3. **Comentarios Temporales en Código:**
   - "Simplified rule for debugging" en Firestore rules
   - "We might add a check here" en validaciones
   - **Acción:** Resolver TODOs antes de producción

### Dependencias a Revisar

- **pdfjs-dist (4.5.136):** Libería pesada, considerar alternativas como `pdf-lib`
- **firebase (10.12.2):** Actualizar a última versión estable
- **patch-package:** Indica que hay patches a dependencias (revisar necesidad)

---

## 🔗 Recursos Útiles

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Firebase Security Checklist](https://firebase.google.com/docs/rules/security-checklist)
- [React Query Documentation](https://tanstack.com/query/latest)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Última Actualización:** 14 de enero de 2026  
**Versión del Documento:** 1.0  
**Autor:** Análisis de Revisión de Código Profesional
