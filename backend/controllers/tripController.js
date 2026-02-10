const TripPlan = require("../models/TripPlan");
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


exports.createTripPackage = async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const uploadResult = await streamUpload(req.file.buffer, "trip-packages");
      imageUrl = uploadResult.secure_url;
    }

    const trip = await TripPlan.create({
      ...req.body,
      image: imageUrl,
    });

    res.status(201).json(trip);
  } catch (err) {
    console.error("Create trip package error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTripPackage = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Optional image update
    if (req.file) {
      const uploadResult = await streamUpload(req.file.buffer, "trip-packages");
      updateData.image = uploadResult.secure_url;
    }

    const trip = await TripPlan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip package not found" });
    }

    res.json(trip);
  } catch (err) {
    console.error("Update trip package error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE TRIP PACKAGE (ADMIN) =================
exports.deleteTripPackage = async (req, res) => {
  try {
    const trip = await TripPlan.findByIdAndDelete(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip package not found" });
    }

    res.json({ message: "Trip package deleted successfully" });
  } catch (err) {
    console.error("Delete trip package error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL TRIP PACKAGES =================
exports.getTripPackages = async (req, res) => {
  try {
    const trips = await TripPlan.find().populate("hotels rooms");
    res.json(trips);
  } catch (err) {
    console.error("Get trip packages error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
