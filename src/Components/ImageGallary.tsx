
import { useEffect, useState } from "react";
import { 
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton, Box, Image, Avatar, Grid, useDisclosure, Spinner } from "@chakra-ui/react";
import { getFirestore, collection,  onSnapshot } from "firebase/firestore";
import firebase_app from "../firebase/config";
import ImageCard from "./ImageCard";
import { getUserInfo } from "../helpers/getUserInfo";
import { getPhotoComments } from "@/helpers/getPhotoComments";
import { ChatIcon } from '@chakra-ui/icons'

const ImageGallery: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [images, setImages] = useState<{id: string, url: string, userName: string | undefined, userPhoto: string | undefined, commentsCount: number}[]>([]);
    const [selectedImage, setSelectedImage] = useState<{id: string, url: string, userName: string | undefined, userPhoto: string | undefined, commentsCount: number}>()
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
              return { id: doc.id, url: imageData.url, userName: userInfo?.name, userPhoto: userInfo?.photoUrl, commentsCount: photoComments.length };
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
          <Grid key={image.id}  position="relative" onClick={() => {
            setSelectedImage(image)
            onOpen()
          }}>
            <Image
            w="100%"
            borderRadius="xl"
            mb={2}
            src={image.url}
            alt="Alt"
            cursor="pointer"
          />
          <Box position="absolute" display="flex" alignItems="center" backgroundColor="black" width="100%" justifyContent="space-between">
           <Box display="flex" alignItems="center">
           <Avatar borderRadius="0" name={image.userName} src={image.userPhoto} />
           <span style={{fontSize: '10px', marginLeft: '2px', color: 'white', fontWeight: 'bold'}}>{image.userName}</span>
           </Box>
           <span style={{color: 'white', marginRight: '10px'}}>
           <ChatIcon />
           <span style={{marginLeft: '4px'}}>
           {image.commentsCount}
           </span>
           </span>
          </Box>
          </Grid>
        ))}
      </Box>
      }
      </>
    );
  };
  
  export default ImageGallery;
  