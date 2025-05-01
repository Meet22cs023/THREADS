import { Box, Container } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "./atoms/userAtom";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useEffect } from "react";
import useShowToast from "./hooks/useShowToast";

function App() {
	const user = useRecoilValue(userAtom);
	const setUser = useSetRecoilState(userAtom);
	const { pathname, search } = useLocation();
	const navigate = useNavigate();
	const showToast = useShowToast();
	
	// Handle Google OAuth callback at root level
	useEffect(() => {
		// Check if we're on the root page with auth parameters
		if (pathname === '/' && search) {
			const searchParams = new URLSearchParams(search);
			const authSuccess = searchParams.get("authSuccess");
			const userDataParam = searchParams.get("userData");
			const error = searchParams.get("error");
			
			if (error) {
				showToast("Error", error, "error");
				navigate('/auth'); // Redirect to auth page on error
				return;
			}
			
			if (authSuccess === 'true' && userDataParam) {
				try {
					const userData = JSON.parse(decodeURIComponent(userDataParam));
					localStorage.setItem("user-threads", JSON.stringify(userData));
					setUser(userData);
					
					// Clear URL parameters
					window.history.replaceState({}, document.title, '/');
					
					// Show success message
					showToast("Success", "Successfully logged in with Google", "success");
				} catch (error) {
					console.error("Failed to process auth data:", error);
					showToast("Error", "Failed to process authentication data", "error");
					navigate('/auth');
				}
			}
		}
	}, [pathname, search, navigate, setUser, showToast]);
	
	return (
		<Box position={"relative"} w='full'>
			<Container maxW={pathname === "/" ? { base: "620px", md: "900px" } : "620px"}>
				<Header />
				<Routes>
					<Route path='/' element={user ? <HomePage /> : <Navigate to='/auth' />} />
					<Route path='/auth' element={!user ? <AuthPage /> : <Navigate to='/' />} />
					<Route path='/update' element={user ? <UpdateProfilePage /> : <Navigate to='/auth' />} />

					<Route
						path='/:username'
						element={
							user ? (
								<>
									<UserPage />
									<CreatePost />
								</>
							) : (
								<UserPage />
							)
						}
					/>
					<Route path='/:username/post/:pid' element={<PostPage />} />
					<Route path='/chat' element={user ? <ChatPage /> : <Navigate to={"/auth"} />} />
					<Route path='/settings' element={user ? <SettingsPage /> : <Navigate to={"/auth"} />} />
				</Routes>
			</Container>
		</Box>
	);
}

export default App;
