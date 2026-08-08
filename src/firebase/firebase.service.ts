import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Configuración del proyecto Firebase (tomada de firebase.js)
const firebaseConfig = {
  projectId: 'tutuca-inscritos',
  storageBucket: 'tutuca-inscritos.firebasestorage.app',
};

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firestore: admin.firestore.Firestore | null = null;

  onModuleInit() {
    if (admin.apps.length === 0) {
      // 1. Intentar encontrar 'firebase-service-account.json' o cualquier *.json de firebase en la raíz
      let serviceAccountPath = path.join(
        process.cwd(),
        'firebase-service-account.json',
      );

      if (!fs.existsSync(serviceAccountPath)) {
        try {
          const files = fs.readdirSync(process.cwd());
          const found = files.find(
            (f) =>
              f.toLowerCase().includes('firebase') &&
              f.endsWith('.json') &&
              f !== 'package.json',
          );
          if (found) {
            serviceAccountPath = path.join(process.cwd(), found);
          }
        } catch {
          // Ignorar si no se puede leer directorio
        }
      }

      // 2. Si no existe ningún archivo, registrar advertencia y NO tumbar el servidor
      if (!fs.existsSync(serviceAccountPath)) {
        this.logger.warn(
          '⚠️ No se encontró el archivo de credenciales de Firebase (firebase-service-account.json). El servidor funcionará normalmente, pero la importación desde Firebase requerirá dicho archivo.',
        );
        return;
      }

      // 3. Inicializar Admin SDK de forma segura
      try {
        const serviceAccount = JSON.parse(
          fs.readFileSync(serviceAccountPath, 'utf8'),
        );

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: firebaseConfig.projectId,
          storageBucket: firebaseConfig.storageBucket,
        });

        this.firestore = admin.firestore();
        this.logger.log(
          `✅ Firebase Admin SDK inicializado — Proyecto: ${firebaseConfig.projectId}`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Error al inicializar Firebase Admin SDK: ${error.message}`,
        );
        this.firestore = null;
      }
    } else {
      this.firestore = admin.firestore();
    }
  }

  getFirestore(): admin.firestore.Firestore | null {
    return this.firestore;
  }
}

