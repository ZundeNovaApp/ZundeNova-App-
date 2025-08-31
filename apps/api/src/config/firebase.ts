import admin from 'firebase-admin';

export async function initializeFirebase() {
  try {
    if (!admin.apps.length) {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined;

      admin.initializeApp({
        credential: serviceAccount 
          ? admin.credential.cert(serviceAccount)
          : admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
      });
    }
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

export { admin };
