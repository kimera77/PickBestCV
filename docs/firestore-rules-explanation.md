# Reglas de Firestore - Diferencias entre Dev y Producción

## 🔒 Producción (`firestore.rules`)

**Usadas en:** Firebase en producción

**Características:**
- ✅ Requiere autenticación para todas las operaciones
- ✅ Los usuarios solo pueden acceder a sus propios datos
- ✅ Validación de `userId` en todos los documentos
- ✅ Protección contra eliminación de templates por defecto
- ✅ Reglas granulares por colección

## 🛠️ Desarrollo (`firestore.rules.dev`)

**Usadas en:** Emulador local (configurado en `firebase.json`)

**Características:**
- ✅ **IGUALES A PRODUCCIÓN** - Requiere autenticación
- ✅ Mantiene consistencia entre dev y prod
- ✅ Pruebas el flujo real de autenticación en desarrollo
- ✅ Detectas problemas de seguridad antes de producción

**Diferencia clave:**
```
Las reglas son prácticamente idénticas entre dev y prod.
Esto asegura que lo que funciona en dev también funciona en prod.
```

## 🔑 Autenticación en Desarrollo

### En el emulador de Auth:
- ✅ Puedes crear usuarios con cualquier email
- ✅ No requiere contraseña real (el emulador es permisivo)
- ✅ Simula el comportamiento real de Firebase Auth
- ✅ Puedes loguearte como "guest" o con email

### ¿Cómo funciona?
1. Vas a `/login` en tu app (http://localhost:9002/login)
2. Introduces un email (ej: `test@example.com`)
3. El emulador de Auth lo acepta sin validar contraseña
4. Tu app obtiene un `auth.uid` real
5. Las reglas de Firestore funcionan normalmente

## 📝 Colecciones protegidas

### `/jobPositionTemplates/{id}`
- **Lectura**: Cualquier usuario autenticado
- **Creación**: Usuario autenticado (debe poner su propio `userId`)
- **Actualización/Eliminación**: Solo el propietario
  
### `/users/{userId}`
- Solo el usuario propietario puede leer/escribir
  
### `/users/{userId}/cvs/{id}`
- Solo el usuario propietario puede leer/escribir
  
### `/users/{userId}/analysisResults/{id}`
- Solo el usuario propietario puede leer/escribir

## 🚀 Scripts de Inicialización

El script `init-firestore-emulator.ts` usa **Admin SDK** que:
- ❌ **NO** está sujeto a las reglas de seguridad
- ✅ Puede escribir datos sin autenticación
- ✅ Solo funciona en el emulador (por seguridad)
- ✅ Perfecto para crear datos de ejemplo

```bash
# Crear datos de ejemplo (usa Admin SDK)
npm run firebase:emulators:init
```

## 🔄 ¿Cómo funciona?

### En desarrollo (localhost):
1. Firebase Emulator usa `firestore.rules.dev` (**iguales a prod**)
2. Tu app se conecta a `127.0.0.1:8080` (emulador)
3. **Requiere login** (pero el emulador de Auth es permisivo)
4. Datos temporales (se pierden al cerrar el emulador)
5. Scripts con Admin SDK pueden crear datos de ejemplo

### En producción:
1. Firebase usa `firestore.rules` (**iguales a dev**)
2. Tu app se conecta a Firebase cloud
3. Requiere autenticación real
4. Datos persistentes y protegidos

## 🎯 Ventajas de este enfoque

✅ **Consistencia**: Dev y Prod se comportan igual
✅ **Testing**: Pruebas el flujo de autenticación en desarrollo
✅ **Seguridad**: Detectas problemas antes de producción
✅ **Facilidad**: Admin SDK para scripts sin complicaciones

## 🚀 Comandos útiles

```bash
# Iniciar emulador
npm run firebase:emulators

# Crear datos de ejemplo en emulador (usa Admin SDK)
npm run firebase:emulators:init

# Iniciar app en dev (conecta a emuladores)
npm run dev

# Validar reglas antes de deploy
firebase deploy --only firestore:rules --dry-run

# Desplegar reglas a producción
npm run firebase:deploy:firestore
```

## ⚠️ Importante

- Las reglas de **dev y prod son iguales** (o muy similares)
- Siempre debes **loguearte** incluso en desarrollo
- El **Admin SDK** en scripts ignora las reglas (solo en emulador)
- Nunca desplegar `firestore.rules.dev` a producción
