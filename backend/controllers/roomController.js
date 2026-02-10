const Room = require("../models/Room");
const cloudinary = require("../utils/cloudinary");

const streamUpload = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};


exports.createRoom = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const uploadResult = await streamUpload(req.file.buffer, "rooms");
      imageUrl = uploadResult.secure_url;
    }

    const room = await Room.create({
      ...req.body,
      image: imageUrl,
    });

    res.status(201).json(room);
  } catch (err) {
    console.error("Create room error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateRoom = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // optional image update
    if (req.file) {
      const uploadResult = await streamUpload(req.file.buffer, "rooms");
      updateData.image = uploadResult.secure_url;
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    console.error("Update room error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Room deleted" });
  } catch (err) {
    console.error("Delete room error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("hotel");
    res.json(rooms);
  } catch (err) {
    console.error("Get rooms error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
