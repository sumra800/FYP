
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import userRoutes from "./routes/userRoute.js";
import assignmentRoutes from "./routes/assignmentRoute.js";
import reminderRoutes from "./routes/reminderRoute.js";
import codeRoutes from "./routes/codeRoute.js";
import eventRoutes from "./routes/eventRoute.js";
import googleClassroomRoutes from "./routes/googleClassroomRoute.js";
import partnershipRoutes from "./routes/partnershipRoute.js";
import partnersRoutes from "./routes/partnersRoute.js";
import resourceRoutes from "./routes/resourceRoute.js";
import studySessionRoutes from "./routes/studySessionRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import { startAutoSync } from "./services/classroomSyncService.js";

const app = express();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Serving static files from:', uploadsPath);

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, path) => {
    console.log('Serving file:', path);
    // Set proper headers for images
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL || "mongodb://localhost:27017/studybuddy";

// Routes
app.use("/api/users", userRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/codes", codeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/google-classroom", googleClassroomRoutes);
app.use("/api/partners", partnersRoutes);
app.use("/api/partners", partnershipRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/study-sessions", studySessionRoutes);
app.use("/api/chat", chatRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Study Buddy API is running!" });
});

// Test route for uploads
app.get("/test-uploads", (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  const files = fs.readdirSync(uploadsDir);
  res.json({ 
    message: "Uploads directory contents", 
    files: files,
    uploadsPath: uploadsPath
  });
});

// Direct file serving route
app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  console.log('Requested file:', filename);
  console.log('File path:', filePath);
  console.log('File exists:', fs.existsSync(filePath));
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Connect to MongoDB
console.log("Attempting to connect to MongoDB:", MONGOURL);
mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("Connected to MongoDB successfully");
    
    // Start Google Classroom auto-sync service
    startAutoSync();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
      console.log(`API endpoints available at: http://localhost:${PORT}/api/users`);
      console.log(`Google Classroom integration enabled`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
    console.log("Please make sure MongoDB is running on your system");
  });
