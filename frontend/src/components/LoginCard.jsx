import {
	Flex,
	Box,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	Stack,
	Button,
	Heading,
	Text,
	useColorModeValue,
	Link,
	Divider,
	HStack,
	Icon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSetRecoilState } from "recoil";
import authScreenAtom from "../atoms/authAtom";
import useShowToast from "../hooks/useShowToast";
import userAtom from "../atoms/userAtom";
import { FcGoogle } from "react-icons/fc";
import { useLocation } from "react-router-dom";

export default function LoginCard() {
	const [showPassword, setShowPassword] = useState(false);
	const setAuthScreen = useSetRecoilState(authScreenAtom);
	const setUser = useSetRecoilState(userAtom);
	const [loading, setLoading] = useState(false);
	const location = useLocation();
	const showToast = useShowToast();
	
	const [inputs, setInputs] = useState({
		username: "",
		password: "",
	});
	
	// Handle Google OAuth callback
	useEffect(() => {
		// Check URL parameters for auth success
		const searchParams = new URLSearchParams(location.search);
		const authSuccess = searchParams.get("authSuccess");
		const userDataParam = searchParams.get("userData");
		const error = searchParams.get("error");
		
		if (error) {
			showToast("Error", error, "error");
		}
		
		if (authSuccess && userDataParam) {
			try {
				const userData = JSON.parse(decodeURIComponent(userDataParam));
				localStorage.setItem("user-threads", JSON.stringify(userData));
				setUser(userData);
				// Clear URL parameters
				window.history.replaceState({}, document.title, window.location.pathname);
			} catch (error) {
				showToast("Error", "Failed to process authentication data", "error");
			}
		}
	}, [location, setUser, showToast]);
	
	const handleLogin = async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/users/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(inputs),
			});
			const data = await res.json();
			if (data.error) {
				showToast("Error", data.error, "error");
				return;
			}
			localStorage.setItem("user-threads", JSON.stringify(data));
			setUser(data);
		} catch (error) {
			showToast("Error", error, "error");
		} finally {
			setLoading(false);
		}
	};
	
	const handleGoogleLogin = () => {
		setLoading(true);
		try {
			// For debugging, log OAuth URL
			console.log("Redirecting to Google OAuth...");
			
			// Use the backend URL directly for OAuth as the proxy might cause issues
			const apiUrl = window.location.href.includes('localhost:3000')
				? '/api/auth/google'  // Use proxy for local development
				: 'http://localhost:5003/api/auth/google'; // Use direct URL for production
				
			window.location.href = apiUrl;
		} catch (error) {
			showToast("Error", "Failed to initiate Google login", "error");
			setLoading(false);
		}
	};
	
	return (
		<Flex align={"center"} justify={"center"}>
			<Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
				<Stack align={"center"}>
					<Heading fontSize={"4xl"} textAlign={"center"}>
						Login
					</Heading>
				</Stack>
				<Box
					rounded={"lg"}
					bg={useColorModeValue("white", "gray.dark")}
					boxShadow={"lg"}
					p={8}
					w={{
						base: "full",
						sm: "400px",
					}}
				>
					<Stack spacing={4}>
						<Button 
							w={"full"} 
							variant={"outline"} 
							leftIcon={<Icon as={FcGoogle} boxSize={5} />}
							onClick={handleGoogleLogin}
						>
							Sign in with Google
						</Button>
						
						<HStack>
							<Divider />
							<Text fontSize="sm" color="gray.500">OR</Text>
							<Divider />
						</HStack>
						
						<FormControl isRequired>
							<FormLabel>Username</FormLabel>
							<Input
								type='text'
								value={inputs.username}
								onChange={(e) => setInputs((inputs) => ({ ...inputs, username: e.target.value }))}
							/>
						</FormControl>
						<FormControl isRequired>
							<FormLabel>Password</FormLabel>
							<InputGroup>
								<Input
									type={showPassword ? "text" : "password"}
									value={inputs.password}
									onChange={(e) => setInputs((inputs) => ({ ...inputs, password: e.target.value }))}
								/>
								<InputRightElement h={"full"}>
									<Button
										variant={"ghost"}
										onClick={() => setShowPassword((showPassword) => !showPassword)}
									>
										{showPassword ? <ViewIcon /> : <ViewOffIcon />}
									</Button>
								</InputRightElement>
							</InputGroup>
						</FormControl>
						<Stack spacing={10} pt={2}>
							<Button
								loadingText='Logging in'
								size='lg'
								bg={useColorModeValue("gray.600", "gray.700")}
								color={"white"}
								_hover={{
									bg: useColorModeValue("gray.700", "gray.800"),
								}}
								onClick={handleLogin}
								isLoading={loading}
							>
								Login
							</Button>
						</Stack>
						<Stack pt={6}>
							<Text align={"center"}>
								Don&apos;t have an account?{" "}
								<Link color={"blue.400"} onClick={() => setAuthScreen("signup")}>
									Sign up
								</Link>
							</Text>
						</Stack>
					</Stack>
				</Box>
			</Stack>
		</Flex>
	);
}
