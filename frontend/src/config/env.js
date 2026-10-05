export const env = {
  APP_NAME: 'SDTT Privacy Governance',
  APP_VERSION: '0.1.0',
  APP_ENV: import.meta.env.MODE || 'development',
  API_BASE_URL: import.meta.env.VITE_API_URL || '/api',
  FIREBASE: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sdtt-governance.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sdtt-governance',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sdtt-governance.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
  },
};

export default env;
