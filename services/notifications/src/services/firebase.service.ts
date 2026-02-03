import * as admin from 'firebase-admin';
import { Config } from '../config';

export class FirebaseService {
  private app: admin.app.App | null = null;
  private initialized = false;

  constructor(config: Config) {
    try {
      if (config.firebase.key && config.firebase.key.trim() !== '') {
        const serviceAccount = JSON.parse(config.firebase.key);
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.initialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize Firebase:', error);
    }
  }

  async sendPushNotification(fcmToken: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
    if (!this.initialized || !this.app) {
      throw new Error('Firebase not initialized');
    }

    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data,
      });
    } catch (error) {
      throw new Error(`Failed to send push notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
