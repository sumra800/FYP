
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL || "mongodb://localhost:27017/studybuddy";

// Routes
app.use("/api/users", userRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Study Buddy API is running!" });
});

// Connect to MongoDB
console.log("Attempting to connect to MongoDB:", MONGOURL);
mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
      console.log(`API endpoints available at: http://localhost:${PORT}/api/users`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
    console.log("Please make sure MongoDB is running on your system");
  });
