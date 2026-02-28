const express = require("express");
const router = express.Router();
const {
    index,
    create,
    store,
    show,
    profile,
    destroy,
    edit,
    update,
    dash
} = require("../controllers/blogController");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Public Routes
router.get("/post/:id", show);

// Protected Routes
router.get("/", isLoggedIn, index);
router.get("/dashboard", isLoggedIn, dash);
router.get("/create", isLoggedIn, create);
router.post("/create", isLoggedIn, upload.single("image"), store);
router.get("/profile", isLoggedIn, profile);

// Edit & Delete
router.get("/post/edit/:id", isLoggedIn, edit);
router.post("/post/edit/:id", isLoggedIn, upload.single("image"), update);
router.get("/post/delete/:id", isLoggedIn, destroy);

module.exports = router;
