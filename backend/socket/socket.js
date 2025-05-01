import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

const userSocketMap = {}; // userId: socketId

export const getRecipientSocketId = (recipientId) => {
	return userSocketMap[recipientId];
};

io.on("connection", (socket) => {
	console.log("✅ User connected:", socket.id);

	const userId = socket.handshake.query.userId;
	if (userId !== "undefined") {
		userSocketMap[userId] = socket.id;
		io.emit("getOnlineUsers", Object.keys(userSocketMap));
	}

	// ✅ Handle sending messages
	socket.on("sendMessage", async ({ recipientId, message }) => {
		try {
			// 1. Save message to DB
			const newMessage = new Message(message);
			await newMessage.save();

			// 2. Emit to recipient if online
			const recipientSocketId = userSocketMap[recipientId];
			if (recipientSocketId) {
				io.to(recipientSocketId).emit("newMessage", newMessage);
			}
		} catch (error) {
			console.error("Error sending message:", error);
		}
	});

	// ✅ Handle marking messages as seen
	socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
		try {
			await Message.updateMany({ conversationId, seen: false }, { $set: { seen: true } });
			await Conversation.updateOne({ _id: conversationId }, { $set: { "lastMessage.seen": true } });

			const userSocketId = userSocketMap[userId];
			if (userSocketId) {
				io.to(userSocketId).emit("messagesSeen", { conversationId });
			}
		} catch (error) {
			console.error("Error marking messages as seen:", error);
		}
	});

	// ✅ Handle disconnect
	socket.on("disconnect", () => {
		console.log("❌ User disconnected:", socket.id);
		if (userId) {
			delete userSocketMap[userId];
			io.emit("getOnlineUsers", Object.keys(userSocketMap));
		}
	});
});

export { io, server, app };
