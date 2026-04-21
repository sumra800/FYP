import Chat from "../model/chatModel.js";

// Get user's chat history
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    let chat = await Chat.findOne({ user: userId });
    
    // If no chat exists, return an empty array of messages
    if (!chat) {
      return res.status(200).json({ messages: [] });
    }
    
    res.status(200).json({ messages: chat.messages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history", error: error.message });
  }
};

// Update/Save user's chat history
export const saveChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages array is required" });
    }

    let chat = await Chat.findOne({ user: userId });

    if (chat) {
      chat.messages = messages;
      await chat.save();
    } else {
      chat = await Chat.create({
        user: userId,
        messages: messages
      });
    }

    res.status(200).json({ message: "Chat history saved successfully", chat });
  } catch (error) {
    res.status(500).json({ message: "Error saving chat history", error: error.message });
  }
};

// Clear user's chat history
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const chat = await Chat.findOne({ user: userId });

    if (chat) {
      chat.messages = [];
      await chat.save();
    }
    
    res.status(200).json({ message: "Chat history cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing chat history", error: error.message });
  }
};
