import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { INITIAL_PRODUCTS } from './src/data/products.js';

// Firebase config - .env dosyasından okunur
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedProducts() {
  console.log('Ürünler Firebase\'e ekleniyor...');
  
  for (const product of INITIAL_PRODUCTS) {
    try {
      const { id, ...productData } = product;
      await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✓ ${product.title} eklendi`);
    } catch (error) {
      console.error(`✗ ${product.title} eklenemedi:`, error.message);
    }
  }
  
  console.log('Seed işlemi tamamlandı!');
}

seedProducts();
