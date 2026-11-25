// Firebase configuration template for MOUNAM
// Loads values securely from Vite environment variables

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'MOCK_FIREBASE_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mounam-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mounam-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mounam-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456',
};

export const isFirebaseConfigured = (): boolean => {
  return (
    Boolean(import.meta.env.VITE_FIREBASE_API_KEY) &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'MOCK_FIREBASE_API_KEY'
  );
};
