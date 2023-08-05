import firebase_app from '@/firebase/config';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

export async function getUserName(userId: string): Promise<string> {
  const db = getFirestore(firebase_app);
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? userDoc.data()?.name || null : null;
}