import Event from "../model/eventModel.js";
import User from "../model/userModel.js";
import mongoose from "mongoose";

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      organizer,
      location,
      eventDate,
      startTime,
      endTime,
      maxAttendees,
      tags,
      isRecurring,
      recurringPattern,
      registrationRequired,
      registrationDeadline,
      contactEmail,
      contactPhone,
      imageUrl,
      isFeatured,
      scope
    } = req.body;

    const createdBy = req.userId;

    if (!title || !description || !eventType || !organizer || !location || !eventDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Title, description, event type, organizer, location, event date, start time, and end time are required."
      });
    }

    // Validate scope and authorization
    if (scope === 'society') {
      const user = await User.findById(createdBy);
      if (!user || !user.societyPosition) {
        return res.status(403).json({
          success: false,
          message: "Only users with a society position can create society events."
        });
      }
    }

    // Validate event date is in the future
    const eventDateTime = new Date(`${eventDate}T${startTime}`);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Event date and time must be in the future."
      });
    }

    // Validate end time is after start time
    const startDateTime = new Date(`${eventDate}T${startTime}`);
    const endDateTime = new Date(`${eventDate}T${endTime}`);
    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time."
      });
    }

    const newEvent = new Event({
      title,
      description,
      eventType,
      organizer,
      location,
      eventDate: new Date(eventDate),
      startTime,
      endTime,
      maxAttendees: maxAttendees || null,
      tags: tags || [],
      isRecurring: isRecurring || false,
      recurringPattern: isRecurring ? recurringPattern : null,
      registrationRequired: registrationRequired || false,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      contactEmail,
      contactPhone,
      imageUrl,
      isFeatured: isFeatured || false,
      scope: scope || 'personal',
      createdBy
    });

    await newEvent.save();
    res.status(201).json({ success: true, message: "Event created successfully.", event: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Get all events with filtering and pagination
export const getAllEvents = async (req, res) => {
  try {
    const {
      eventType,
      tags,
      isFeatured,
      isUpcoming,
      sortBy = "eventDate",
      sortOrder = "asc",
      page = 1,
      limit = 10,
      search
    } = req.query;

    const query = { isActive: true };

    if (eventType) query.eventType = eventType;
    if (tags) query.tags = { $in: tags.split(',') };
    if (isFeatured === 'true') query.isFeatured = true;
    if (isUpcoming === 'true') {
      const now = new Date();
      query.eventDate = { $gte: now };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort
    };

    const events = await Event.find(query, null, options)
      .populate('createdBy', 'fullName nickname profilePicture score universityName societyPosition')
      .populate('attendees', 'fullName nickname profilePicture score');

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      events,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Get a single event by ID
export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const event = await Event.findById(id)
      .populate('createdBy', 'fullName nickname profilePicture score universityName societyPosition')
      .populate('attendees', 'fullName nickname profilePicture score');

    if (!event || !event.isActive) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Get user's created events
export const getUserEvents = async (req, res) => {
  try {
    const userId = req.userId;
    const { sortBy = "eventDate", sortOrder = "asc", page = 1, limit = 10 } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort
    };

    const events = await Event.find({ createdBy: userId }, null, options)
      .populate('createdBy', 'fullName nickname profilePicture score universityName societyPosition')
      .populate('attendees', 'fullName nickname profilePicture score');

    const total = await Event.countDocuments({ createdBy: userId });

    res.status(200).json({
      success: true,
      events,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Get user's registered events
export const getUserRegisteredEvents = async (req, res) => {
  try {
    const userId = req.userId;
    const { sortBy = "eventDate", sortOrder = "asc", page = 1, limit = 10 } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const options = {
      skip: (parseInt(page) - 1) * parseInt(limit),
      limit: parseInt(limit),
      sort
    };

    const events = await Event.find({
      attendees: userId,
      isActive: true
    }, null, options)
      .populate('createdBy', 'fullName nickname profilePicture score universityName societyPosition')
      .populate('attendees', 'fullName nickname profilePicture score');

    const total = await Event.countDocuments({ attendees: userId, isActive: true });

    res.status(200).json({
      success: true,
      events,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Error fetching user registered events:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    // Only allow the creator to update the event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    if (event.createdBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this event." });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'fullName nickname profilePicture score universityName')
      .populate('attendees', 'fullName nickname profilePicture score');

    res.status(200).json({ success: true, message: "Event updated successfully.", event: updatedEvent });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    if (event.createdBy.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this event." });
    }

    // Soft delete by setting isActive to false
    await Event.findByIdAndUpdate(id, { isActive: false });

    res.status(200).json({ success: true, message: "Event deleted successfully." });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Register for an event
export const registerForEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const event = await Event.findById(id);
    if (!event || !event.isActive) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    // Check if user is already registered
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ success: false, message: "You are already registered for this event." });
    }

    // Check if event is full
    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ success: false, message: "Event is full." });
    }

    // Check if registration is still open
    if (event.registrationRequired && event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ success: false, message: "Registration deadline has passed." });
    }

    // Check if event is in the future
    const eventDateTime = new Date(`${event.eventDate.toISOString().split('T')[0]}T${event.startTime}`);
    if (eventDateTime <= new Date()) {
      return res.status(400).json({ success: false, message: "Cannot register for past events." });
    }

    event.attendees.push(userId);
    event.currentAttendees += 1;
    await event.save();

    res.status(200).json({ success: true, message: "Successfully registered for the event." });
  } catch (error) {
    console.error("Error registering for event:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Unregister from an event
export const unregisterFromEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid event ID." });
    }

    const event = await Event.findById(id);
    if (!event || !event.isActive) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    // Check if user is registered
    if (!event.attendees.includes(userId)) {
      return res.status(400).json({ success: false, message: "You are not registered for this event." });
    }

    event.attendees = event.attendees.filter(attendeeId => attendeeId.toString() !== userId);
    event.currentAttendees = Math.max(0, event.currentAttendees - 1);
    await event.save();

    res.status(200).json({ success: true, message: "Successfully unregistered from the event." });
  } catch (error) {
    console.error("Error unregistering from event:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Get event statistics
export const getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ isActive: true });
    const upcomingEvents = await Event.countDocuments({
      isActive: true,
      eventDate: { $gte: new Date() }
    });
    const eventsByType = await Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$eventType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const featuredEvents = await Event.countDocuments({ isActive: true, isFeatured: true });

    res.status(200).json({
      success: true,
      totalEvents,
      upcomingEvents,
      eventsByType,
      featuredEvents
    });
  } catch (error) {
    console.error("Error fetching event stats:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
