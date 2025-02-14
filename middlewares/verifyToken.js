const jwt = require("jsonwebtoken");
const User = require("../models/user_model");

const verifyToken = async (req, res, next) => {
  const tokenHeader = req.headers["authorization"];
  const token =  (tokenHeader && tokenHeader.split(" ")[1]);

  if (!token) {
    return res
      .status(401)
      .json({
        status: "error",
        message: "Authentication required to access this route",
      });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.token !== token) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: "error", message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
