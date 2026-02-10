const Hotel = require("../models/Hotel");
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


exports.createHotel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Hotel image is required",
      });
    }

    const uploadResult = await streamUpload(req.file.buffer, "hotels");

    const hotel = await Hotel.create({
      name: req.body.name,
      location: req.body.location,
      description: req.body.description,
      amenities: req.body.amenities,
      pricePerNight: Number(req.body.pricePerNight),
      image: uploadResult.secure_url,
    });

    res.status(201).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error("CREATE HOTEL ERROR:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateHotel = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // normalize price
    if (updateData.pricePerNight !== undefined) {
      updateData.pricePerNight = Number(updateData.pricePerNight);
    }

    // optional image update
    if (req.file) {
      const uploadResult = await streamUpload(req.file.buffer, "hotels");
      updateData.image = uploadResult.secure_url;
    }

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error("UPDATE HOTEL ERROR:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: hotels,
    });
  } catch (error) {
    console.error("GET HOTELS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    console.error("GET HOTEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= DELETE HOTEL (ADMIN) =================
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    console.error("DELETE HOTEL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
