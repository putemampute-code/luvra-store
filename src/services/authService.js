import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const registerUser = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  await setDoc(doc(db, 'users', userCredential.user.uid), {
    name,
    email,
    role: 'customer',
    createdAt: new Date().toISOString(),
    addresses: []
  });
  return userCredential.user;
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
  return {
    ...userCredential.user,
    ...(userDoc.exists() ? userDoc.data() : {})
  };
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const getUserProfile = async (uid) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  return userDoc.exists() ? { id: uid, ...userDoc.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
