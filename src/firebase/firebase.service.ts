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
  private firestore: admin.firestore.Firestore;

  onModuleInit() {
    if (admin.apps.length === 0) {
      const serviceAccountPath = path.join(
        process.cwd(),
        'firebase-service-account.json',
      );

      if (!fs.existsSync(serviceAccountPath)) {
        this.logger.error(
          '❌ No se encontró firebase-service-account.json en la raíz del proyecto.',
        );
        this.logger.error(
          '   Descárgalo desde: Firebase Console → Project Settings → Service accounts → Generate new private key',
        );
        return;
      }

      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8'),
      );

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
      });

      this.logger.log(
        `✅ Firebase Admin SDK inicializado — Proyecto: ${firebaseConfig.projectId}`,
      );
    }

    this.firestore = admin.firestore();
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }
}

