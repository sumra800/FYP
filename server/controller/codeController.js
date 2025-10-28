import Code from "../model/codeModel.js";
import User from "../model/userModel.js";
import mongoose from "mongoose";

// Create a new code snippet
export const createCode = async (req, res) => {
  try {
    const {
      title,
      description,
      language,
      code,
      tags
    } = req.body;

    // Validation
    if (!title || !language || !code) {
      return res.status(400).json({
        success: false,
        message: "Title, language, and code content are required"
      });
    }

    const newCode = new Code({
      userId: req.userId,
      title: title.trim(),
      description: description?.trim() || "",
      language: language.toLowerCase(),
      code: code.trim(),
      tags: tags || []
    });

    await newCode.save();

    // Populate user information for response
    await newCode.populate('userId', 'nickname fullName profilePicture score');

    res.status(201).json({
      success: true,
      message: "Code uploaded successfully",
      code: newCode
    });

  } catch (error) {
    console.error("Create code error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during code creation"
    });
  }
};

// Get all public code snippets
export const getAllCodes = async (req, res) => {
  try {
    const { language, sortBy = "createdAt", sortOrder = "desc", page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = { isPublic: true };
    if (language) query.language = language.toLowerCase();

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const codes = await Code.find(query)
      .populate('userId', 'nickname fullName profilePicture score')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-code'); // Don't include full code in list view

    const totalCodes = await Code.countDocuments(query);

    res.status(200).json({
      success: true,
      codes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCodes / parseInt(limit)),
        totalCodes,
        hasNext: skip + codes.length < totalCodes,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Get all codes error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get a single code snippet with full details
export const getCode = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid code ID"
      });
    }

    const code = await Code.findById(id)
      .populate('userId', 'nickname fullName profilePicture score')
      .populate('comments.userId', 'nickname fullName profilePicture score')
      .populate('likes', 'nickname fullName score');

    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code not found"
      });
    }

    // Increment view count
    code.views += 1;
    await code.save();

    res.status(200).json({
      success: true,
      code
    });

  } catch (error) {
    console.error("Get code error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get user's own code snippets
export const getUserCodes = async (req, res) => {
  try {
    const { sortBy = "createdAt", sortOrder = "desc" } = req.query;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const codes = await Code.find({ userId: req.userId })
      .populate('userId', 'nickname fullName profilePicture score')
      .sort(sort);

    res.status(200).json({
      success: true,
      codes
    });

  } catch (error) {
    console.error("Get user codes error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update a code snippet
export const updateCode = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid code ID"
      });
    }

    // Remove fields that shouldn't be updated
    delete updateData.userId;
    delete updateData.likes;
    delete updateData.comments;
    delete updateData.views;
    delete updateData.createdAt;

    const code = await Code.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'nickname fullName profilePicture score');

    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code not found or not authorized"
      });
    }

    res.status(200).json({
      success: true,
      message: "Code updated successfully",
      code
    });

  } catch (error) {
    console.error("Update code error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during code update"
    });
  }
};

// Delete a code snippet
export const deleteCode = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid code ID"
      });
    }

    const code = await Code.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code not found or not authorized"
      });
    }

    res.status(200).json({
      success: true,
      message: "Code deleted successfully"
    });

  } catch (error) {
    console.error("Delete code error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during code deletion"
    });
  }
};

// Add a comment to a code snippet
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid code ID"
      });
    }

    const code = await Code.findById(id);
    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code not found"
      });
    }

    const newComment = {
      userId: req.userId,
      comment: comment.trim()
    };

    code.comments.push(newComment);
    await code.save();

    // Populate the new comment with user info
    await code.populate('comments.userId', 'nickname fullName profilePicture score');

    const addedComment = code.comments[code.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: addedComment
    });

  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during comment addition"
    });
  }
};

// Like/Unlike a code snippet
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid code ID"
      });
    }

    const code = await Code.findById(id);
    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code not found"
      });
    }

    const userId = req.userId;
    const isLiked = code.likes.includes(userId);

    if (isLiked) {
      code.likes.pull(userId);
    } else {
      code.likes.push(userId);
    }

    await code.save();

    res.status(200).json({
      success: true,
      message: isLiked ? "Code unliked" : "Code liked",
      isLiked: !isLiked,
      likesCount: code.likes.length
    });

  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during like toggle"
    });
  }
};

// Get code statistics
export const getCodeStats = async (req, res) => {
  try {
    const stats = await Code.aggregate([
      { $match: { isPublic: true } },
      {
        $group: {
          _id: "$language",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: { $size: "$likes" } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalCodes = await Code.countDocuments({ isPublic: true });
    const totalViews = await Code.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalCodes,
        totalViews: totalViews[0]?.total || 0,
        languageStats: stats
      }
    });

  } catch (error) {
    console.error("Get code stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Approve a comment and award points
export const approveComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { points = 10 } = req.body; // Default 10 points per approved comment

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid code ID"
      });
    }

    const code = await Code.findById(id);
    if (!code) {
      return res.status(404).json({
        success: false,
        message: "Code not found"
      });
    }

    // Check if the user is the author of the code
    if (code.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the code author can approve comments"
      });
    }

    // Find the comment
    const comment = code.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found"
      });
    }

    // Check if already approved
    if (comment.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Comment is already approved"
      });
    }

    // Update comment status
    comment.isApproved = true;
    comment.pointsAwarded = points;

    // Award points to the commenter
    const commenter = await User.findById(comment.userId);
    if (commenter) {
      commenter.score += points;
      await commenter.save();
    }

    await code.save();

    res.status(200).json({
      success: true,
      message: `Comment approved! ${points} points awarded to ${commenter?.nickname || commenter?.fullName || 'user'}`,
      comment,
      newScore: commenter?.score
    });

  } catch (error) {
    console.error("Approve comment error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during comment approval"
    });
  }
};

// Get leaderboard (top scorers)
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topUsers = await User.find({})
      .select('fullName nickname profilePicture score universityName')
      .sort({ score: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      leaderboard: topUsers
    });

  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
