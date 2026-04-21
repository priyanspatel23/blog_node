const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { sendOtpEmail, generateOtp } = require("../utils/mailerServics");

const renderRegister = (req, res) => {
  res.render("pages/register", { user: req.user, title: "Create Account" });
};

const handleRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.redirect("/register");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    req.flash("success", "Registration successful. Please login.");
    res.redirect("/login");
  } catch (error) {
    console.error("Register error:", error);
    req.flash("error", "Something went wrong during registration.");
    res.redirect("/register");
  }
};

const renderLogin = (req, res) => {
  res.render("pages/login", { user: req.user, title: "Welcome Back" });
};

const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "Invalid credentials.");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Invalid credentials.");
      return res.redirect("/login");
    }

    res.cookie("userId", user._id, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
    return res.redirect("/");
  } catch (error) {
    next(error);
  }
};

const handleLogout = (req, res) => {
  res.clearCookie("userId");
  req.flash("success", "You have been logged out.");
  res.redirect("/login");
};

const renderForgotPassword = (req, res) => {
  res.render("pages/forgot-password", { user: req.user, title: "Forgot Password" });
};

const handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/forgot-password");
    }

    const otp = generateOtp(4);

    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    try {
      await sendOtpEmail(email, otp, user.name);
    } catch (mailErr) {
      console.error("Mail service failed:", mailErr);
    }

    req.flash("success", "OTP sent to your email.");
    res.redirect(`/verify-otp?email=${email}`);
  } catch (error) {
    console.error("Forgot pass error:", error);
    req.flash("error", "Could not send OTP. Try again later.");
    res.redirect("/forgot-password");
  }
};

const renderVerifyOtp = (req, res) => {
  res.render("pages/verify-otp", { user: req.user, title: "Verify OTP", email: req.query.email });
};

const handleVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });

    if (!user) {
      req.flash("error", "Invalid or expired OTP.");
      return res.redirect(`/verify-otp?email=${email}`);
    }

    res.render("pages/reset-password", { user: req.user, title: "Reset Password", email, otp });
  } catch (error) {
    res.redirect("/forgot-password");
  }
};

const handleResetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render("pages/reset-password", { user: req.user, title: "Reset Password", email, otp });
    }

    const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });

    if (!user) {
      req.flash("error", "Session expired. Try again.");
      return res.redirect("/forgot-password");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    req.flash("success", "Password updated successfully.");
    res.redirect("/login");
  } catch (error) {
    req.flash("error", "Failed to reset password.");
    res.redirect("/forgot-password");
  }
};

module.exports = {
  renderRegister,
  handleRegister,
  renderLogin,
  handleLogin,
  handleLogout,
  renderForgotPassword,
  handleForgotPassword,
  renderVerifyOtp,
  handleVerifyOtp,
  handleResetPassword
};
