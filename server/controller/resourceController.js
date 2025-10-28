import Resource from "../model/resourceModel.js";
import User from "../model/userModel.js";
import path from "path";
import fs from "fs";

// Create/Upload a new resource
export const createResource = async (req, res) => {
  try {
    const { title, resourceType, courseName, year, semester, description, tags } = req.body;
    const userId = req.user.id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // Get user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Parse tags if they're sent as a string
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Create resource object
    const resource = new Resource({
      title,
      resourceType,
      courseName,
      year,
      semester,
      description,
      fileName: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      uploadedBy: userId,
      authorName: user.nickname || user.fullName,
      tags: parsedTags
    });

    await resource.save();

    res.status(201).json({
      message: "Resource uploaded successfully",
      resource
    });
  } catch (error) {
    console.error("Error creating resource:", error);
    
    // Delete uploaded file if there's an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    
    res.status(500).json({ message: "Failed to upload resource", error: error.message });
  }
};

// Get all resources with filters
export const getAllResources = async (req, res) => {
  try {
    const { resourceType, courseName, year, semester, search } = req.query;
    
    // Build query
    let query = { isApproved: true, isPublic: true };
    
    if (resourceType) query.resourceType = resourceType;
    if (courseName) query.courseName = new RegExp(courseName, 'i');
    if (year) query.year = year;
    if (semester) query.semester = semester;
    
    // Search in title, courseName, or description
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { courseName: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const resources = await Resource.find(query)
      .populate('uploadedBy', 'fullName nickname email')
      .sort({ uploadedAt: -1 })
      .limit(100);

    res.status(200).json({
      message: "Resources retrieved successfully",
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error("Error getting resources:", error);
    res.status(500).json({ message: "Failed to retrieve resources", error: error.message });
  }
};

// Get resources by type (Past Papers or Notes)
export const getResourcesByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!["pastPaper", "notes", "tutorial"].includes(type)) {
      return res.status(400).json({ message: "Invalid resource type" });
    }

    const resources = await Resource.find({ 
      resourceType: type,
      isApproved: true,
      isPublic: true
    })
      .populate('uploadedBy', 'fullName nickname email')
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      message: `${type} retrieved successfully`,
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error("Error getting resources by type:", error);
    res.status(500).json({ message: "Failed to retrieve resources", error: error.message });
  }
};

// Get user's uploaded resources
export const getMyResources = async (req, res) => {
  try {
    const userId = req.user.id;

    const resources = await Resource.find({ uploadedBy: userId })
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      message: "Your resources retrieved successfully",
      count: resources.length,
      resources
    });
  } catch (error) {
    console.error("Error getting user resources:", error);
    res.status(500).json({ message: "Failed to retrieve your resources", error: error.message });
  }
};

// Get single resource by ID
export const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id)
      .populate('uploadedBy', 'fullName nickname email');

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.status(200).json({
      message: "Resource retrieved successfully",
      resource
    });
  } catch (error) {
    console.error("Error getting resource:", error);
    res.status(500).json({ message: "Failed to retrieve resource", error: error.message });
  }
};

// Download a resource (increment download count)
export const downloadResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Check if file exists
    if (!fs.existsSync(resource.filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    // Send file
    res.download(resource.filePath, resource.fileName);
  } catch (error) {
    console.error("Error downloading resource:", error);
    res.status(500).json({ message: "Failed to download resource", error: error.message });
  }
};

// Update a resource
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, tags } = req.body;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Check if user owns the resource
    if (resource.uploadedBy.toString() !== userId) {
      return res.status(403).json({ message: "You can only update your own resources" });
    }

    // Update fields
    if (title) resource.title = title;
    if (description) resource.description = description;
    if (tags) {
      resource.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    await resource.save();

    res.status(200).json({
      message: "Resource updated successfully",
      resource
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ message: "Failed to update resource", error: error.message });
  }
};

// Delete a resource
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Check if user owns the resource
    if (resource.uploadedBy.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own resources" });
    }

    // Delete file from server
    if (fs.existsSync(resource.filePath)) {
      fs.unlinkSync(resource.filePath);
    }

    // Delete from database
    await Resource.findByIdAndDelete(id);

    res.status(200).json({
      message: "Resource deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ message: "Failed to delete resource", error: error.message });
  }
};

// Get unique years and courses for filters
export const getResourceFilters = async (req, res) => {
  try {
    const years = await Resource.distinct('year');
    const courses = await Resource.distinct('courseName');
    const semesters = await Resource.distinct('semester');

    res.status(200).json({
      message: "Filters retrieved successfully",
      filters: {
        years: years.sort((a, b) => b - a),
        courses: courses.sort(),
        semesters
      }
    });
  } catch (error) {
    console.error("Error getting filters:", error);
    res.status(500).json({ message: "Failed to retrieve filters", error: error.message });
  }
};

export default {
  createResource,
  getAllResources,
  getResourcesByType,
  getMyResources,
  getResourceById,
  downloadResource,
  updateResource,
  deleteResource,
  getResourceFilters
};

