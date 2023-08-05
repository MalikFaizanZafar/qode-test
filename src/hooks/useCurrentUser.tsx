import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import firebase_app from "../firebase/config";

const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth(firebase_app);
    const unsubscribe = onAuthStateChanged(auth, setUser);
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return user;
}

export default useCurrentUser;
