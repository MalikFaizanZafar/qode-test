import firebase_app from '@/firebase/config';
import { getDocs, getFirestore } from 'firebase/firestore';
import { collection, query, where } from "firebase/firestore";
export async function getPhotoComments(imageId: string) {
  const db = getFirestore(firebase_app);
  const commentsRef = collection(db, "comments");
  const q = query(commentsRef, where("imageId", "==", imageId));
  const commentsDoc = await getDocs(q);
  let comments: any[] = []
  commentsDoc.forEach(doc => {
    comments.push({
        id: doc.id,
        text: doc.data().text
    })
  })
  return comments
}