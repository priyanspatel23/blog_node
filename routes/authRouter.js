const express = require("express");
const router = express.Router();
const { reg, log, regPost, logPost, out, forgot, forgotP, vOtp, vOtpP, reset } = require("../controllers/authController");

router.get("/register", reg);
router.get("/login", log);

router.post("/register", regPost);
router.post("/login", logPost);
router.get("/logout", out);

// Forgot Password Flow
router.get("/forgot-password", forgot);
router.post("/forgot-password", forgotP);
router.get("/verify-otp", vOtp);
router.post("/verify-otp", vOtpP);
router.post("/reset-password", reset);

module.exports = router;