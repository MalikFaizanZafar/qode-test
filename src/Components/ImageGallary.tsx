
import { Grid, } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getFirestore, collection,  onSnapshot } from "firebase/firestore";
import firebase_app from "../firebase/config";
import ImageCard from "./ImageCard";
import { getUserName } from "./getUserName";

const ImageGallery: React.FC = () => {
    const [images, setImages] = useState<{url: string, userName: string}[]>([]);
  
    useEffect(() => {
        const fetchImages = async () => {
          const db = getFirestore(firebase_app);
          const query = collection(db, "photos");
          
          const unsubscribe = onSnapshot(query, async (querySnapshot) => {
            const imagesData = await Promise.all(querySnapshot.docs.map(async doc => {
              const imageData = doc.data();
              const userName = await getUserName(imageData.userId);
              return { id: doc.id, url: imageData.url, userName };
            }));
            
            setImages(imagesData);
          });
    
          // Clean up the subscription on unmount
          return () => unsubscribe();
        };
        
        fetchImages();
      }, []);
  
    return (
      <Grid templateColumns="repeat(3, 1fr)" margin={20} gap={6}>
        {images.map((image, index) => (
          <ImageCard key={index} image={image} userName={image.userName} />
        ))}
      </Grid>
    );
  };
  
  export default ImageGallery;
  