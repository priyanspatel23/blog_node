const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/register", authController.renderRegister);
router.post("/register", authController.handleRegister);

router.get("/login", authController.renderLogin);
router.post("/login", authController.handleLogin);

router.get("/logout", authController.handleLogout);

router.get("/forgot-password", authController.renderForgotPassword);
router.post("/forgot-password", authController.handleForgotPassword);

router.get("/verify-otp", authController.renderVerifyOtp);
router.post("/verify-otp", authController.handleVerifyOtp);

router.post("/reset-password", authController.handleResetPassword);

module.exports = router;