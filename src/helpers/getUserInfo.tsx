import firebase_app from '@/firebase/config';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

type UserInfo = {
  name: string,
  photoUrl: string
}
export async function getUserInfo(userId: string): Promise<UserInfo | null> {
  const db = getFirestore(firebase_app);
  const userDoc = await getDoc(doc(db, 'users', userId));
  return userDoc.exists() ? {
    name: userDoc.data().name,
    photoUrl: userDoc.data().photoUrl 
  }: null;
}