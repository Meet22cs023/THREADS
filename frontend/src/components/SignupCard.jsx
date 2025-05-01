import {
	Flex,
	Box,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	HStack,
	InputRightElement,
	Stack,
	Button,
	Heading,
	Text,
	useColorModeValue,
	Link,
	Divider,
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

export default function SignupCard() {
	const [showPassword, setShowPassword] = useState(false);
	const setAuthScreen = useSetRecoilState(authScreenAtom);
	const [inputs, setInputs] = useState({
		name: "",
		username: "",
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const location = useLocation();
	const showToast = useShowToast();
	const setUser = useSetRecoilState(userAtom);
	const [emailError, setEmailError] = useState("");

	// Email format validation
	const isValidEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Handle input change for email
	const handleEmailChange = (e) => {
		const email = e.target.value;
		setInputs({ ...inputs, email });

		if (!isValidEmail(email)) {
			setEmailError("Invalid email format");
		} else {
			setEmailError("");
		}
	};

	// Handle Google OAuth callback
	useEffect(() => {
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
				window.history.replaceState({}, document.title, window.location.pathname);
			} catch (error) {
				showToast("Error", "Failed to process authentication data", "error");
			}
		}
	}, [location, setUser, showToast]);

	const handleSignup = async () => {
		if (!isValidEmail(inputs.email)) {
			showToast("Invalid Email", "Please enter a valid email address.", "error");
			return;
		}

		try {
			setLoading(true);
			const res = await fetch("/api/users/signup", {
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
			showToast("Error", error.message, "error");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignup = () => {
		setLoading(true);
		try {
			console.log("Redirecting to Google OAuth...");

			const apiUrl = window.location.href.includes('localhost:3000')
				? '/api/auth/google'
				: 'http://localhost:5003/api/auth/google';

			window.location.href = apiUrl;
		} catch (error) {
			showToast("Error", "Failed to initiate Google sign-up", "error");
			setLoading(false);
		}
	};

	return (
		<Flex align={"center"} justify={"center"}>
			<Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
				<Stack align={"center"}>
					<Heading fontSize={"4xl"} textAlign={"center"}>
						Sign up
					</Heading>
				</Stack>
				<Box rounded={"lg"} bg={useColorModeValue("white", "gray.dark")} boxShadow={"lg"} p={8}>
					<Stack spacing={4}>
						<Button
							w={"full"}
							variant={"outline"}
							leftIcon={<Icon as={FcGoogle} boxSize={5} />}
							onClick={handleGoogleSignup}
						>
							Sign up with Google
						</Button>

						<HStack>
							<Divider />
							<Text fontSize="sm" color="gray.500">OR</Text>
							<Divider />
						</HStack>

						<HStack>
							<Box>
								<FormControl isRequired>
									<FormLabel>Full name</FormLabel>
									<Input
										type='text'
										onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
										value={inputs.name}
									/>
								</FormControl>
							</Box>
							<Box>
								<FormControl isRequired>
									<FormLabel>Username</FormLabel>
									<Input
										type='text'
										onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
										value={inputs.username}
									/>
								</FormControl>
							</Box>
						</HStack>

						<FormControl isRequired isInvalid={!!emailError}>
							<FormLabel>Email address</FormLabel>
							<Input
								type='email'
								onChange={handleEmailChange}
								value={inputs.email}
							/>
							{emailError && (
								<Text color="red.500" fontSize="sm">{emailError}</Text>
							)}
						</FormControl>

						<FormControl isRequired>
							<FormLabel>Password</FormLabel>
							<InputGroup>
								<Input
									type={showPassword ? "text" : "password"}
									onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
									value={inputs.password}
								/>
								<InputRightElement h={"full"}>
									<Button
										variant={"ghost"}
										onClick={() => setShowPassword((show) => !show)}
									>
										{showPassword ? <ViewIcon /> : <ViewOffIcon />}
									</Button>
								</InputRightElement>
							</InputGroup>
						</FormControl>

						<Stack spacing={10} pt={2}>
							<Button
								loadingText='Submitting'
								size='lg'
								bg={useColorModeValue("gray.600", "gray.700")}
								color={"white"}
								_hover={{
									bg: useColorModeValue("gray.700", "gray.800"),
								}}
								onClick={handleSignup}
								isLoading={loading}
							>
								Sign up
							</Button>
						</Stack>
						<Stack pt={6}>
							<Text align={"center"}>
								Already a user?{" "}
								<Link color={"blue.400"} onClick={() => setAuthScreen("login")}>
									Login
								</Link>
							</Text>
						</Stack>
					</Stack>
				</Box>
			</Stack>
		</Flex>
	);
}
