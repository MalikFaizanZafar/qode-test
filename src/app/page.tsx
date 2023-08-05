'use client'
import ImageUpload from '@/Components/ImageUpload'
import NavBar from '@/Components/navbar'
import { Box, Flex,} from '@chakra-ui/react'
import ImageGallery from '@/Components/ImageGallary';
import useCurrentUser from '@/hooks/useCurrentUser';
export default function Home() {
  const user = useCurrentUser();

  return (
  <Flex direction={'column'} h="100vh" >
     <Box>
        <NavBar />
        {user &&<ImageUpload/>}
      </Box>
      <Box overflowY="auto" flex="1">
        <ImageGallery />
      </Box>
  
  </Flex>
  )
}
