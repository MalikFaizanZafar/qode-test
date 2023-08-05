import { useState } from "react";
import {
  Box,
  Button,
  useToast,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import firebase_app from "../firebase/config";
import { User } from "firebase/auth";
import useCurrentUser from "@/hooks/useCurrentUser";
// Initialize Firebase Storage and Firestore
const storage = getStorage(firebase_app);
const db = getFirestore(firebase_app);

const ImageUpload: React.FC = () => {
  const toast = useToast();
  const user = useCurrentUser();
  const [image, setImage] = useState<File | null>(null);
  //   const [url, setUrl] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (image) {
      try {
        const storageRef = ref(storage, `photos/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // progress function
          },
          (error) => {
            // Handle unsuccessful uploads
            console.log(error);
          },
          async () => {
            // Handle successful uploads on complete
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            //   setUrl(downloadURL);
            await addDoc(collection(db, "photos"), {
              url: downloadURL,
              name: image.name,
              userId: user?.uid,
            });
            onClose();
            setImage(null);
          }
        );

        toast({
          title: "Image Uploaded.",
          description: "Your image has been successfully uploaded.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Error.",
          description: "An error occurred while adding your comment.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box margin={10}>
      <Button onClick={onOpen}   bgColor={'#FF0080'} textColor={'white'}  _hover={{ bg: '#FF3399', textColor: 'white' }}  >
        Upload Image
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} mt={4}>
              <Input
                type="file"
                onChange={handleChange}
                hidden
                id="upload-button"
              />
              <label htmlFor="upload-button">
                <Box as="span" cursor="pointer" color="blue.500">
                  Choose Image
                </Box>
              </label>
              {image && <Text fontSize="sm">{image.name}</Text>}
              {/* {url && <Image src={url} alt="" boxSize="200px" marginTop="3" />} */}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpload} bgColor={'#FF0080'} textColor={'white'}  _hover={{ bg: '#FF3399', textColor: 'white' }}>
              Upload
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImageUpload;
