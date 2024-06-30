const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  sendForgotPasswordCode,
  validateCode,
  resetPassword,
  getAllUsers,
} = require("../controller/userController");
const { auth, isAdmin } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/myprofile", auth, getProfile);
router.post("/send-reset-code", sendForgotPasswordCode);
router.post("/validate-code", validateCode);
router.patch("/reset-password", resetPassword);
router.get("/get-all-users", auth, isAdmin, getAllUsers);

module.exports = router;
