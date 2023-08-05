
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import firebase_app from "../firebase/config";
import { signInWithPopup, getAuth,GoogleAuthProvider,signOut,onAuthStateChanged, } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
const auth = getAuth(firebase_app);
const NavBar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Replace with actual authentication status


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsLoggedIn(!!user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  const handleLoginLogout = async () => {
    console.log("ooo")
    if (!isLoggedIn) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        setIsLoggedIn(true); 
        if (user) {
            // Store the user's information in Firestore
            const db = getFirestore(firebase_app);
            await setDoc(doc(db, 'users', user.uid), {
              name: user.displayName,
              photoUrl: user.photoURL
            }, { merge: true });
          }
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        await signOut(auth);
        setIsLoggedIn(false); // user is now logged out
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Flex
      as="nav"
      bgGradient='linear(to-l, #7928CA, #FF0080)'
      align="center"
      width={'100%'}
      justify="space-between"
      wrap="wrap"
      padding={6}
  
      color="white"
    >
      <Flex align="center" mr={5}>
        <Text fontSize="lg" fontWeight="bold">
        QODE
        </Text>
      </Flex>

      <Box>
        <Button textColor={'white'} bg="transparent"  border="1px" onClick={handleLoginLogout} _hover={{ bg: 'transparent', textColor: 'white' }}>
          {isLoggedIn ? 'Log Out' : 'Log In'}
        </Button>
      </Box>
    </Flex>
  );
}

export default NavBar;
