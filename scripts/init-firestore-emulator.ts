/**
 * Script para inicializar datos de ejemplo en el emulador de Firestore
 * 
 * Usa Admin SDK para evitar las reglas de seguridad
 * Solo para desarrollo local
 */

import * as admin from 'firebase-admin';

// Configuración para el emulador
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

// Inicializar Admin SDK (ignora reglas de seguridad)
admin.initializeApp({
  projectId: 'studio-2697715951-c0e8e',
});

const db = admin.firestore();

async function initializeData() {
  try {
    console.log('🔥 Inicializando datos en Firestore Emulator usando Admin SDK...');

    // Crear usuario de ejemplo
    await db.collection('users').doc('example-user').set({
      email: 'example@test.com',
      displayName: 'Usuario de Ejemplo',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      settings: {
        language: 'es',
        notifications: true
      }
    });
    console.log('✅ Usuario de ejemplo creado');

    // Crear plantillas de trabajo
    await db.collection('jobPositionTemplates').doc('example-template-1').set({
      title: 'Desarrollador Full Stack',
      description: 'Buscamos desarrollador con experiencia en React y Node.js',
      userId: 'example-user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Plantilla 1 creada');

    await db.collection('jobPositionTemplates').doc('example-template-2').set({
      title: 'Diseñador UX/UI',
      description: 'Diseñador con experiencia en Figma y Adobe XD',
      userId: 'example-user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Plantilla 2 creada');

    // Crear análisis de CV de ejemplo
    await db.collection('cvAnalyses').doc('example-analysis').set({
      userId: 'example-user',
      templateId: 'example-template-1',
      fileName: 'cv-ejemplo.pdf',
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      score: 85,
      matchResults: {
        overallMatch: 85,
        strengths: ['Experiencia relevante', 'Habilidades técnicas'],
        weaknesses: ['Falta experiencia en liderazgo']
      }
    });
    console.log('✅ Análisis de ejemplo creado');

    console.log('\n🎉 Datos inicializados correctamente en el emulador');
    console.log('📊 Puedes verlos en: http://127.0.0.1:4000/firestore');
    console.log('\n💡 Tip: Ahora puedes loguearte en la app con cualquier email');
    console.log('   El emulador de Auth no requiere contraseña real en desarrollo\n');
    
  } catch (error) {
    console.error('❌ Error inicializando datos:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

initializeData();
