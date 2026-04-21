import express from "express";
import { getChatHistory, saveChatHistory, clearChatHistory } from "../controller/chatController.js";
import { verifyToken } from "../controller/userController.js";

const router = express.Router();

router.route("/")
  .get(verifyToken, getChatHistory)
  .post(verifyToken, saveChatHistory);

router.route("/clear")
  .delete(verifyToken, clearChatHistory);

export default router;
