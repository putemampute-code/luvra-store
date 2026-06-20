import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

const PAYMENTS_COLLECTION = 'payments';

export const createPayment = async (paymentData) => {
  const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), {
    ...paymentData,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updatePaymentStatus = async (id, status, details = {}) => {
  const docRef = doc(db, PAYMENTS_COLLECTION, id);
  await updateDoc(docRef, { 
    status, 
    ...details,
    updatedAt: serverTimestamp() 
  });
};

export const initializeIyzicoPayment = async ({ price, paidPrice, basketId, user, cardInfo, shippingAddress, billingAddress, items }) => {
  // Server-side Iyzico API call via Cloud Function
  // This is a client-side wrapper that calls your backend
  const response = await fetch('/api/iyzico/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      price,
      paidPrice,
      basketId,
      user,
      cardInfo,
      shippingAddress,
      billingAddress,
      items
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ödeme başlatılamadı');
  }
  
  return response.json();
};

export const confirmIyzicoPayment = async (paymentId, conversationId) => {
  const response = await fetch('/api/iyzico/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, conversationId })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ödeme onaylanamadı');
  }
  
  return response.json();
};
