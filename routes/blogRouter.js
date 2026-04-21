const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/post/:id", blogController.viewPost);

router.get("/", isLoggedIn, blogController.getHomePage);
router.get("/dashboard", isLoggedIn, blogController.getDashboard);

router.get("/create", isLoggedIn, blogController.renderCreatePost);
router.post("/create", isLoggedIn, upload.single("image"), blogController.createPost);

router.get("/profile", isLoggedIn, blogController.getUserProfile);

router.get("/post/edit/:id", isLoggedIn, blogController.renderEditPost);
router.post("/post/edit/:id", isLoggedIn, upload.single("image"), blogController.updatePost);

router.get("/post/delete/:id", isLoggedIn, blogController.deletePost);

module.exports = router;
