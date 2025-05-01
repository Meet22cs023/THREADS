import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalBody, 
  Input, 
  InputGroup, 
  InputLeftElement, 
  Text, 
  Flex, 
  SkeletonCircle, 
  Avatar, 
  Box, 
  useColorModeValue,
  VStack
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import useDebounce from "../hooks/useDebounce";

const SearchModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const showToast = useShowToast();
  const debouncedSearch = useDebounce(search, 500);
  const bgColor = useColorModeValue("white", "gray.dark");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/users/search/${debouncedSearch}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setSearchResults(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearch, showToast]);

  const handleUserClick = (username) => {
    navigate(`/${username}`);
    onClose();
    setSearch("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset="slideInBottom">
      <ModalOverlay 
        bg="blackAlpha.300" 
        backdropFilter="blur(10px)"
      />
      <ModalContent 
        bg={bgColor} 
        borderRadius="xl" 
        shadow="xl"
        maxW={{ base: "90%", md: "450px" }}
        mt="80px"
      >
        <ModalBody p={6}>
          <InputGroup size="lg" mb={4}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Search users..."
              focusBorderColor="blue.500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              variant="filled"
              size="lg"
              borderRadius="full"
            />
          </InputGroup>

          <VStack spacing={4} align="stretch" maxH="350px" overflowY="auto">
            {isLoading && (
              <>
                {[...Array(3)].map((_, i) => (
                  <Flex key={i} gap={2} alignItems="center" p={2}>
                    <SkeletonCircle size="10" />
                    <Box w="full">
                      <Box h="10px" w="120px" bg="gray.200" borderRadius="full" mb={2} />
                      <Box h="8px" w="100px" bg="gray.200" borderRadius="full" />
                    </Box>
                  </Flex>
                ))}
              </>
            )}

            {!isLoading && searchResults.length === 0 && search.trim() !== "" && (
              <Text textAlign="center" color="gray.500">
                No users found
              </Text>
            )}

            {!isLoading && search.trim() === "" && (
              <Text textAlign="center" color="gray.500">
                Try searching for people by name or username
              </Text>
            )}

            {!isLoading &&
              searchResults.map((user) => (
                <Flex 
                  key={user._id} 
                  gap={2} 
                  alignItems="center" 
                  p={3}
                  borderRadius="lg"
                  cursor="pointer"
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleUserClick(user.username)}
                >
                  <Avatar name={user.name} src={user.profilePic} size="md" />
                  <Box>
                    <Text fontWeight="bold">{user.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      @{user.username}
                    </Text>
                  </Box>
                </Flex>
              ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SearchModal; 