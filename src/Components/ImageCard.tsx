
import firebase_app from "@/firebase/config";
import useCurrentUser from "@/hooks/useCurrentUser";
import { Box, Button,  HStack, Image, Input, Text,VStack,useToast , Grid, Avatar} from "@chakra-ui/react";
import { addDoc, collection,  getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

interface ImageCardProps {
    image: any;
    userName: string | undefined;
  }
  
  const ImageCard: React.FC<ImageCardProps> = ({ image, userName }) => {

    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const toast = useToast();
    const user = useCurrentUser();
    useEffect(() => {
        const loadComments = async () => {
          const db = getFirestore(firebase_app);
          const commentsQuery = query(
            collection(db, 'comments'),
            where('imageId', '==', image.id),
            orderBy('timestamp')
          );
          
          const unsubscribe = onSnapshot(commentsQuery, (commentsSnapshot) => {
            const commentsData = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(commentsData);
          });
      
          // Remember to unsubscribe from your real-time listener when your component unmounts.
          return unsubscribe;

        };
    
        loadComments();
      }, [image.id]);

      const handleCommentSubmit = async () => {
        if (newComment.trim() !== '' && user) {
         try {
            const db = getFirestore(firebase_app);
            await addDoc(collection(db, 'comments'), {
              text: newComment,
              userId: user.uid,
              imageId: image.id,
              userName: user?.displayName || 'Anonymous',
              timestamp: new Date().toISOString(),
            });
  
            toast({
              title: "Comment added.",
              description: "Your comment has been successfully added.",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
      
            setNewComment('');
            
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
        <Grid display="flex" alignItems="start" >
          <Grid>
            <Image objectFit="cover" objectPosition="center" w="1000px" h="800px" src={image.url} alt="Image" />
          </Grid>
          <Grid display="flex">
          <Box p="6" mt="auto">
          <Box display="flex" marginBottom="5">
            <Box display="flex" alignItems="center">
            <Avatar name={image.userName} src={image.userPhoto} />
            <span style={{fontSize: '10px', marginLeft: '2px', fontWeight: 'bold'}}>{image.userName}</span>
            </Box>
          </Box>
          <hr />
          {user && (  
            <HStack spacing={2} mt={4}>
              <Input 
                variant="filled" 
                placeholder="Write a comment..." 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
              />
              <Button bgColor={'#FF0080'} textColor={'white'}  _hover={{ bg: '#FF3399', textColor: 'white' }} onClick={handleCommentSubmit}>Post</Button>
            </HStack>
          )}
          <VStack overflow="scroll" h="800px" align="start" spacing={2} mt={4}>
            {comments.map(comment => (
              <Box key={comment.id} bg="gray.100" p={2} borderRadius="md">
                <Text><strong>@{comment.userName}:</strong> {comment.text}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
          </Grid>
        </Grid>
    )
  }

  export default ImageCard;
  