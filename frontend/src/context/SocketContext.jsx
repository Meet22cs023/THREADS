import { createContext, useContext, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import io from "socket.io-client";
import userAtom from "../atoms/userAtom";

// Create Context
const SocketContext = createContext();

// Custom Hook to access Socket
export const useSocket = () => {
	return useContext(SocketContext);
};

// Provider Component
export const SocketContextProvider = ({ children }) => {
	const user = useRecoilValue(userAtom);
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);

	useEffect(() => {
		if (user?._id) {
			const newSocket = io("http://localhost:5003", {
				query: { userId: user._id },
			});

			setSocket(newSocket);

			// Listen for online users list
			newSocket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			// Cleanup on unmount
			return () => newSocket.close();
		}
	}, [user?._id]);

	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};
