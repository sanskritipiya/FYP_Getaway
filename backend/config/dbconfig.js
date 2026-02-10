const mongoose = require("mongoose"); // Import mongoose

const connectDB = async () => { // Simple async function to connect MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI); 
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB error:", error.message); 
    process.exit(1); 
  }
};

module.exports = connectDB; // Export the connectDB function
