import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const ORDERS_COLLECTION = 'orders';

export const createOrder = async (orderData) => {
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...orderData,
    status: 'hazırlanıyor',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return docRef.id;
};

export const getOrdersByUser = async (userId) => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAllOrders = async () => {
  const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getOrderById = async (id) => {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const updateOrderStatus = async (id, status) => {
  const docRef = doc(db, ORDERS_COLLECTION, id);
  await updateDoc(docRef, { 
    status, 
    updatedAt: serverTimestamp() 
  });
};
