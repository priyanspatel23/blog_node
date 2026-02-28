const User = require("../models/user");
const bcrypt = require("bcryptjs");


const { sendOtpEmail, generateOtp } = require("../utils/mailerServics");

/* ===== REGISTER ===== */
const reg = (req, res) => {
  res.render("pages/register", { user: req.user, title: "Create Account" });
};

const regPost = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    req.flash("success", "Registration successful! Welcome to LUXBLOG. 🚀");
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    req.flash("error", "Registration failed. Please try again.");
    res.redirect("/register");
  }
};

/* ===== LOGIN ===== */
const log = (req, res) => {
  res.render("pages/login", { user: req.user, title: "Welcome Back" });
};

const logPost = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }

    // Set user ID in cookie
    res.cookie("userId", user._id, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });

    return res.redirect("/");
  } catch (err) {
    console.log(err);
    next(err);
  }
};

/* ===== LOGOUT ===== */
const out = (req, res) => {
  res.clearCookie("userId");
  req.flash("success", "Logged out successfully. See you soon! 👋");
  res.redirect("/login");
};

/* ===== FORGOT PASSWORD ===== */
const forgot = (req, res) => {
  res.render("pages/forgot-password", { user: req.user, title: "Forgot Password" });
};

const forgotP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "No account found with that email address.");
      return res.redirect("/forgot-password");
    }

    const otp = generateOtp(4);
    console.log("Generated OTP:", otp);

    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send the email
    try {
      await sendOtpEmail(email, otp, user.name);
    } catch (mailErr) {
      console.log("Error sending email:", mailErr.message);
    }

    req.flash("success", "OTP sent successfully! Please check your inbox. 📧");
    res.redirect("/verify-otp?email=" + email);
  } catch (err) {
    console.log("Forgot Password Error:", err);
    req.flash("error", "Failed to send recovery code. Please try again.");
    res.redirect("/forgot-password");
  }
};

/* ===== VERIFY OTP ===== */
const vOtp = (req, res) => {
  res.render("pages/verify-otp", { user: req.user, title: "Verify OTP", email: req.query.email });
};

const vOtpP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });

    if (!user) {
      req.flash("error", "Invalid or expired OTP.");
      return res.redirect(`/verify-otp?email=${email}`);
    }

    res.render("pages/reset-password", { user: req.user, title: "Reset Password", email, otp });
  } catch (err) {
    console.log(err);
    res.redirect("/forgot-password");
  }
};

/* ===== RESET PASSWORD ===== */
const reset = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render("pages/reset-password", { user: req.user, title: "Reset Password", email, otp });
    }

    const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });

    if (!user) {
      req.flash("error", "Invalid or expired session. Please try again.");
      return res.redirect("/forgot-password");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    req.flash("success", "Password reset successful! You can now log in. 🔐");
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    req.flash("error", "Password reset failed. Please try the process again.");
    res.redirect("/forgot-password");
  }
};

/* ===== RESET PASSWORD GET (Optional fallback) ===== */
const resetPasswordGet = (req, res) => {
  res.redirect("/forgot-password");
};

module.exports = { reg, regPost, log, logPost, out, forgot, forgotP, vOtp, vOtpP, reset };
