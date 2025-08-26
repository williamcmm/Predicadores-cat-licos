// Configuración e inicialización de Firebase
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AQUÍ_TU_API_KEY",
  authDomain: "AQUÍ_TU_AUTH_DOMAIN",
  projectId: "AQUÍ_TU_PROJECT_ID",
  storageBucket: "AQUÍ_TU_STORAGE_BUCKET",
  messagingSenderId: "AQUÍ_TU_MESSAGING_SENDER_ID",
  appId: "AQUÍ_TU_APP_ID"
};

const app = initializeApp(firebaseConfig);

export default app;
