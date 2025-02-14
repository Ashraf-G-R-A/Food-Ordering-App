const express = require("express");
const userController = require("../controllers/user_controller");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();


router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

router.get("/", verifyToken, userController.getAllUsers);

router
  .route("/:id")
  .get(verifyToken, userController.getUserById)
  .delete(verifyToken, userController.deleteUser)
  .patch(verifyToken, userController.updateUser);

module.exports = router;

