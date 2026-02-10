const Booking = require("../models/Booking");
const Room = require("../models/Room");
const sendBookingEmail = require("../utils/sendBookingEmail");

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("hotel room")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    console.error("GET USER BOOKINGS ERROR:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};


exports.bookRoom = async (req, res) => {
  try {
    const { hotel, room, checkIn, checkOut, totalAmount } = req.body;
    const user = req.user;

    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 🚫 BLOCK ADMIN FROM BOOKING
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins cannot book rooms from user portal",
      });
    }

    if (!hotel || !room || !checkIn || !checkOut || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "All booking details are required",
      });
    }

    const roomData = await Room.findById(room);
    if (!roomData || !roomData.availability) {
      return res.status(400).json({
        success: false,
        message: "Room not available",
      });
    }

    const booking = await Booking.create({
      user: user.id,
      hotel,
      room,
      checkIn,
      checkOut,
      totalAmount,
      bookingStatus: "CONFIRMED",
    });

    // Mark room as unavailable
    roomData.availability = false;
    await roomData.save();

    // Send confirmation email
    let emailSent = false;
    try {
      await sendBookingEmail({
        to: user.email,
        userName: user.name,
        hotelName: hotel.name || hotel, // adjust depending on your Hotel schema
        roomNumber: roomData.number || roomData._id,
        checkIn,
        checkOut,
        totalAmount,
      });
      emailSent = true;
    } catch (err) {
      console.error("EMAIL ERROR:", err.message);
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? "Booking confirmed and email sent"
        : "Booking confirmed (email failed)",
      emailSent,
      data: booking,
    });
  } catch (err) {
    console.error("BOOK ROOM ERROR:", err.message);
    res.status(500).json({
      success: false,
      message: "Booking failed",
    });
  }
};


exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("room");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (booking.bookingStatus === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled",
      });
    }

    booking.bookingStatus = "CANCELLED";
    await booking.save();

    // Free the room
    if (booking.room) {
      booking.room.availability = true;
      await booking.room.save();
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (err) {
    console.error("CANCEL BOOKING ERROR:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
    });
  }
};


exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("hotel room");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (err) {
    console.error("GET BOOKING ERROR:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
};


exports.getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("hotel room")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    console.error("GET ALL BOOKINGS ERROR:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};
