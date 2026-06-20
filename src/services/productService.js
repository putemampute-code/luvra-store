import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const PRODUCTS_COLLECTION = 'products';

export const getAllProducts = async () => {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getProductsByCategory = async (category) => {
  const q = query(
    collection(db, PRODUCTS_COLLECTION), 
    where('category', '==', category)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getFlashSaleProducts = async () => {
  const q = query(
    collection(db, PRODUCTS_COLLECTION), 
    where('isFlashSale', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getProductById = async (id) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const addProduct = async (productData) => {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...productData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateProduct = async (id, productData) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...productData,
    updatedAt: serverTimestamp()
  });
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
};

export const searchProducts = async (searchTerm) => {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const lower = searchTerm.toLowerCase();
  return allProducts.filter(p => 
    p.title?.toLowerCase().includes(lower) || 
    p.category?.toLowerCase().includes(lower) ||
    p.description?.toLowerCase().includes(lower)
  );
};
