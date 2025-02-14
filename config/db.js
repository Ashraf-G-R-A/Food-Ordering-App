const mongoose = require("mongoose");
const url = process.env.MONGO_URL;
const connectDB = async () => {
  try {
    mongoose.connect(url).then(() => {
        console.log("Connected to MongoDB");
      });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
