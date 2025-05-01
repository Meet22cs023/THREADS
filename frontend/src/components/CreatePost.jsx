import { AddIcon } from "@chakra-ui/icons";
import {
	Button,
	CloseButton,
	Flex,
	FormControl,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	Textarea,
	useColorModeValue,
	useDisclosure,
	Box,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewImg";
import usePreviewVideo from "../hooks/usePreviewVideo";
import { BsFillImageFill } from "react-icons/bs";
import { FaVideo } from "react-icons/fa";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { useParams } from "react-router-dom";

const MAX_CHAR = 500;

const CreatePost = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [postText, setPostText] = useState("");
	const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
	const { handleVideoChange, videoUrl, setVideoUrl } = usePreviewVideo();
	const imageRef = useRef(null);
	const videoRef = useRef(null);
	const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
	const user = useRecoilValue(userAtom);
	const showToast = useShowToast();
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useRecoilState(postsAtom);
	const { username } = useParams();
	const [mediaType, setMediaType] = useState("none");

	const handleTextChange = (e) => {
		const inputText = e.target.value;

		if (inputText.length > MAX_CHAR) {
			const truncatedText = inputText.slice(0, MAX_CHAR);
			setPostText(truncatedText);
			setRemainingChar(0);
		} else {
			setPostText(inputText);
			setRemainingChar(MAX_CHAR - inputText.length);
		}
	};

	const handleMediaSelect = (type) => {
		if (type === "image") {
			setVideoUrl(null);
			setMediaType("image");
			imageRef.current.click();
		} else if (type === "video") {
			setImgUrl(null);
			setMediaType("video");
			videoRef.current.click();
		}
	};

	const handleCreatePost = async () => {
		if (!postText.trim()) {
			showToast("Error", "Post cannot be empty", "error");
			return;
		}
		
		setLoading(true);
		try {
			const res = await fetch("/api/posts/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ 
					postedBy: user._id, 
					text: postText, 
					img: imgUrl, 
					video: videoUrl,
				}),
			});

			const data = await res.json();
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			showToast("Success", "Post created successfully", "success");
			if (username === user.username) {
				setPosts([data, ...posts]);
			}
			onClose();
			setPostText("");
			setImgUrl("");
			setVideoUrl("");
			setMediaType("none");
		} catch (error) {
			showToast("Error", error.message, "error");
		} finally {
			setLoading(false);
		}
	};

	const handleCloseMedia = () => {
		if (mediaType === "image") {
			setImgUrl("");
		} else if (mediaType === "video") {
			setVideoUrl("");
		}
		setMediaType("none");
	};

	return (
		<>
			<Button
				position={"fixed"}
				bottom={10}
				right={5}
				bg={useColorModeValue("gray.300", "gray.dark")}
				onClick={onOpen}
				size={{ base: "sm", sm: "md" }}
			>
				<AddIcon />
			</Button>

			<Modal isOpen={isOpen} onClose={onClose} size="xl">
				<ModalOverlay />

				<ModalContent>
					<ModalHeader>Create Post</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<FormControl>
							<Textarea
								placeholder='Post content goes here..'
								onChange={handleTextChange}
								value={postText}
							/>
							<Text fontSize='xs' fontWeight='bold' textAlign={"right"} m={"1"} color={"gray.800"}>
								{remainingChar}/{MAX_CHAR}
							</Text>

							<Flex align="center" gap={4} my={2}>
								<Input type='file' hidden ref={imageRef} onChange={handleImageChange} accept="image/*" />
								<Input type='file' hidden ref={videoRef} onChange={handleVideoChange} accept="video/*" />

								<Flex 
									gap={4} 
									p={2} 
									borderRadius="md" 
									bg={useColorModeValue("gray.100", "gray.700")}
								>
									<Box
										cursor={"pointer"}
										role="group"
										onClick={() => handleMediaSelect("image")}
										p={2}
										borderRadius="md"
										_hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
									>
										<BsFillImageFill size={20} />
									</Box>
									
									<Box
										cursor={"pointer"}
										role="group"
										onClick={() => handleMediaSelect("video")}
										p={2}
										borderRadius="md"
										_hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
									>
										<FaVideo size={20} />
									</Box>
								</Flex>
								<Text fontSize="sm" color="gray.500">
									{mediaType === "none" ? "Add media to your post" : 
									 mediaType === "image" ? "Image selected" : "Video selected"}
								</Text>
							</Flex>
						</FormControl>

						{imgUrl && (
							<Flex mt={5} w={"full"} position={"relative"}>
								<Image src={imgUrl} alt='Selected img' borderRadius="md" />
								<CloseButton
									onClick={handleCloseMedia}
									bg={"gray.800"}
									position={"absolute"}
									top={2}
									right={2}
								/>
							</Flex>
						)}

						{videoUrl && (
							<Flex mt={5} w={"full"} position={"relative"}>
								<video 
									src={videoUrl} 
									controls 
									style={{ width: "100%", borderRadius: "8px" }} 
								/>
								<CloseButton
									onClick={handleCloseMedia}
									bg={"gray.800"}
									position={"absolute"}
									top={2}
									right={2}
								/>
							</Flex>
						)}
					</ModalBody>

					<ModalFooter>
						<Button 
							colorScheme='blue' 
							mr={3} 
							onClick={handleCreatePost} 
							isLoading={loading}
							isDisabled={!postText.trim()}
						>
							Post
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default CreatePost;
