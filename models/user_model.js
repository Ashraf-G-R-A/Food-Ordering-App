const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const locationSchema = require("./location_model");

const userSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: [true, "Owner's name is required"],
    minlength: 5,
    maxlength: 255,
    validate: {
      validator: function (name) {
        return /^[a-zA-Z ]+$/.test(name);
      },
      message: "Owner's name should only contain letters and spaces",
    },
  },
  restaurantName: {
    type: String,
    required: ["name", "Restaurant name is required"],
    minlength: 3,
    maxlength: 255,
    validate: {
      validator: function (name) {
        return /^[a-zA-Z0-9 ]+$/.test(name);
      },
      message:
        "Restaurant name should only contain letters, numbers, and spaces",
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],  
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Email is not valid",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 8,
    validate: {
      validator: function (password) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);
      },
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
    },
  },
  location: locationSchema, 
  token: {
    type: String,
    default: null,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
userSchema.methods.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  this.token = token;
  return token;
};

module.exports = mongoose.model("User", userSchema);