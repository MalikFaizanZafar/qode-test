
import { useEffect, useState } from "react";
import { 
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton, Box, Image, Avatar, Grid, useDisclosure, Spinner } from "@chakra-ui/react";
import { getFirestore, collection,  onSnapshot } from "firebase/firestore";
import firebase_app from "../firebase/config";
import { ChatIcon } from '@chakra-ui/icons'
import { getPhotoComments } from "@/helpers/getPhotoComments";
import ImageCard from "./ImageCard";
import { getUserInfo } from "../helpers/getUserInfo";

const ImageGallery: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [images, setImages] = useState<{id: string, url: string, userName: string | undefined, userPhoto: string | undefined,commentsCount: number}[]>([]);
    const [selectedImage, setSelectedImage] = useState<{id: string, url: string, userName: string | undefined, userPhoto: string | undefined}>()
    const { isOpen, onOpen, onClose } = useDisclosure()
    useEffect(() => {
        const fetchImages = async () => {
          setLoading(true);
          const db = getFirestore(firebase_app);
          const query = collection(db, "photos");
          
          const unsubscribe = onSnapshot(query, async (querySnapshot) => {
            const imagesData = await Promise.all(querySnapshot.docs.map(async doc => {
              const imageData = doc.data();
              const userInfo = await getUserInfo(imageData.userId);
              const photoComments = await getPhotoComments(doc.id);
              return { id: doc.id, url: imageData.url, userName: userInfo?.name, userPhoto: userInfo?.photoUrl,commentsCount: photoComments.length };
            }));
            
            setImages(imagesData);
            setLoading(false);
          });
    
          // Clean up the subscription on unmount
          return () => unsubscribe();
        };
        
        fetchImages();
      }, []);
    return (
      <>
      <Modal size="full" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
          <ImageCard image={selectedImage} userName={selectedImage?.userName} />
          </ModalBody>
        </ModalContent>
      </Modal>
      {
        loading && 
        <Grid display="flex" justifyContent="center">
          <Spinner
            thickness='4px'
            speed='0.65s'
            emptyColor='gray.200'
            color='blue.500'
            size='xl'
          />
        </Grid>
      }
      {
        !loading && <Box
        padding={4}
        w="100%"
        maxW="1200px"
        mx="auto"
        sx={{ columnCount: [1, 2, 3], columnGap: "8px" }}
      >

        {images.map((image, i) => (
  <Grid key={image.id} position="relative" onClick={() => {
    setSelectedImage(image)
    onOpen()
  }}>
    <Box position="relative"  transition="all 0.3s ease-in-out" cursor="pointer" w="100%" borderRadius="xl" mb={2} _hover={{ ".comment-count": { opacity: 1 }}}>
      <Image
        w="100%"
        borderRadius="xl"
        src={image.url}
        _hover={ { backdropContrast:'#000' }}
        alt="Alt"
      />
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        opacity="0"
        className="comment-count"
        backgroundColor="rgba(0,0,0,0.5)"
        color="white"
        borderRadius="md"
        fontWeight={'bold'}
        transition="opacity 0.3s ease-in-out"
        p={2}
      >
        {image.commentsCount}   <span> <ChatIcon /></span>
      </Box>
    </Box>
  </Grid>
))}

      </Box>
      }
      </>
    );
  };
  
  export default ImageGallery;
  