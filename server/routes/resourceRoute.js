
import express from "express";
import resourceController from "../controller/resourceController.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use absolute path to ensure it works correctly
    const uploadPath = path.join(path.dirname(__dirname), 'uploads', 'resources');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resource-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, TXT, and images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Routes
router.post("/upload", auth, upload.single('file'), resourceController.createResource);
router.get("/all", auth, resourceController.getAllResources);
router.get("/my-resources", auth, resourceController.getMyResources);
router.get("/type/:type", auth, resourceController.getResourcesByType);
router.get("/filters", auth, resourceController.getResourceFilters);
router.get("/:id", auth, resourceController.getResourceById);
router.get("/download/:id", auth, resourceController.downloadResource);
router.put("/:id", auth, resourceController.updateResource);
router.delete("/:id", auth, resourceController.deleteResource);

export default router;

