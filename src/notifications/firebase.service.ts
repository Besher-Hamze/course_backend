import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { existsSync, readFileSync } from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: App | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    if (getApps().length) {
      this.app = getApps()[0];
      return;
    }

    try {
      const jsonInline = this.config.get<string>('FIREBASE_CREDENTIALS_JSON');
      const credPath =
        this.config.get<string>('FIREBASE_CREDENTIALS_PATH') ||
        'secrets/firebase-adminsdk.json';

      let serviceAccount: Record<string, unknown> | undefined;

      if (jsonInline) {
        serviceAccount = JSON.parse(jsonInline);
      } else if (existsSync(credPath)) {
        serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));
      }

      if (!serviceAccount) {
        this.logger.warn(
          'Firebase credentials not found. Set FIREBASE_CREDENTIALS_PATH or secrets/firebase-adminsdk.json',
        );
        return;
      }

      this.app = initializeApp({
        credential: cert(serviceAccount as any),
      });
      this.logger.log('Firebase Admin initialized');
    } catch (error) {
      this.logger.error(`Firebase init failed: ${error.message}`);
    }
  }

  isReady() {
    return !!this.app;
  }

  get messaging(): Messaging {
    if (!this.app) {
      throw new Error('Firebase Admin is not configured');
    }
    return getMessaging(this.app);
  }
}
