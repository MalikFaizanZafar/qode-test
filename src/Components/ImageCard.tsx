
import firebase_app from "@/firebase/config";
import useCurrentUser from "@/hooks/useCurrentUser";
import { Box, Button,  HStack, Heading, Image, Input, Text,VStack,useToast } from "@chakra-ui/react";
import { addDoc, collection,  getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";


interface ImageCardProps {
    image: any;
    userName: string;
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
        <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden" mb={4} display="flex" flexDirection="column" height="100%">
        <Box flexGrow={1}>
          <Image src={image.url} alt="Image" />
        </Box>
      
        <Box p="6" mt="auto">
          <Box display="flex" alignItems="baseline">
            <Heading size="sm" color="gray.500">@{image.userName}</Heading>
          </Box>
      
          <VStack align="start" spacing={2} mt={4}>
            {comments.map(comment => (
              <Box key={comment.id} bg="gray.100" p={2} borderRadius="md">
                <Text><strong>@{comment.userName}:</strong> {comment.text}</Text>
              </Box>
            ))}
          </VStack>
      
          {user && (  
            <HStack spacing={2} mt={4}>
              <Input 
                variant="filled" 
                placeholder="Write a comment..." 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
              />
              <Button colorScheme="blue" onClick={handleCommentSubmit}>Post</Button>
            </HStack>
          )}
        </Box>
      </Box>
    )
  }

  export default ImageCard;
  