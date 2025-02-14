const User = require("../models/user_model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { SUCCESS, ERROR } = require("../utils/StatusText");

const registerUser = async (req, res) => {
  try {
    let { ownerName, restaurantName, email, password, location } = req.body;

    if (!ownerName || !restaurantName || !email || !password || !location) {
      return res
        .status(400)
        .json({ status: "error", message: "All fields are required." });
    }

    const normalizedEmail = email.toLowerCase().trim(); 
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ status: "error", message: "Email already in use." });
    }

 


    const newUser = new User({
      ownerName,
      restaurantName,
      email: normalizedEmail,
      password: hashedPassword,
      location,
      token: null,
    });

    await newUser.save();
    console.log("🔹 Registered Email:", newUser.email);
    console.log("🔹 Registered Hashed Password:", newUser.password);

    res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      user: {
        id: newUser._id,
        ownerName: newUser.ownerName,
        restaurantName: newUser.restaurantName,
        email: newUser.email,
        location: newUser.location,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error.",
        error: error.message,
      });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "User not defined." });
    }

    console.log("🔹 Entered Password Before Comparing:", password);
    console.log("🔹 Stored Hashed Password:", user.password);
    

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "error", message: "Password not correct." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    user.token = token;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        ownerName: user.ownerName,
        restaurantName: user.restaurantName,
        email: user.email,
        location: user.location,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "error",
        message: "Server error.",
        error: error.message,
      });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json({ status: SUCCESS, data: users });
  } catch (error) {
    res
      .status(500)
      .json({ status: ERROR, message: "Server error.", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: ERROR, message: "Invalid user ID." });
    }

    const user = await User.findById(
      id,
      "_id ownerName restaurantName email location"
    );
    if (!user) {
      return res
        .status(404)
        .json({ status: ERROR, message: "User not found." });
    }

    res.json({ status: SUCCESS, data: user });
  } catch (error) {
    res
      .status(500)
      .json({ status: ERROR, message: "Server error.", error: error.message });
  }
};



const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let { password, ...updateData } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "Invalid user ID." });
    }

    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    res.json({
      status: "success",
      message: "User updated successfully.",
      user: {
        id: updatedUser._id,
        ownerName: updatedUser.ownerName,
        restaurantName: updatedUser.restaurantName,
        email: updatedUser.email,
        location: updatedUser.location,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Server error.", error: error.message });
  }
};



const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: ERROR, message: "Invalid user ID." });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res
        .status(404)
        .json({ status: ERROR, message: "User not found." });
    }

    res.json({ status: SUCCESS, message: "User deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ status: ERROR, message: "Server error.", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
