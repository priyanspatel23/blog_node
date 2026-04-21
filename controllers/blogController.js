const Post = require("../models/post");

const getHomePage = async (req, res) => {
    try {
        const posts = await Post.find().populate("author").sort({ createdAt: -1 });
        res.render("index", { user: req.user, posts, title: "Home" });
    } catch (error) {
        res.render("index", { user: req.user, posts: [], error_msg: "Failed to load blogs" });
    }
};

const renderCreatePost = (req, res) => {
    res.render("pages/create-blog", { user: req.user, title: "Write Blog" });
};

const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        let imageUrl;

        if (req.file) {
            imageUrl = "/uploads/" + req.file.filename;
        }

        await Post.create({
            title,
            content,
            imageUrl,
            author: req.user._id
        });

        res.redirect("/");
    } catch (error) {
        console.error("Error creating post:", error);
        res.redirect("/create");
    }
};

const viewPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author");
        if (!post) {
            return res.redirect("/");
        }
        res.render("pages/post-details", { user: req.user, post, title: post.title });
    } catch (error) {
        res.redirect("/");
    }
};

const getUserProfile = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
        res.render("pages/profile", { user: req.user, posts, title: "My Profile" });
    } catch (error) {
        res.redirect("/");
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.redirect("/profile");

        if (post.author.toString() !== req.user._id.toString()) {
            return res.redirect("/profile");
        }

        await Post.findByIdAndDelete(req.params.id);
        req.flash("success", "Blog post removed.");
        res.redirect("/profile");
    } catch (error) {
        res.redirect("/profile");
    }
};

const renderEditPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || post.author.toString() !== req.user._id.toString()) {
            return res.redirect("/profile");
        }
        res.render("pages/edit-blog", { user: req.user, post, title: "Edit Blog" });
    } catch (error) {
        res.redirect("/profile");
    }
};

const updatePost = async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post || post.author.toString() !== req.user._id.toString()) {
            req.flash("error", "You don't have permission to do this.");
            return res.redirect("/profile");
        }

        const updateData = { title, content };
        if (req.file) {
            updateData.imageUrl = "/uploads/" + req.file.filename;
        }

        await Post.findByIdAndUpdate(req.params.id, updateData);
        res.redirect("/profile");
    } catch (error) {
        res.redirect("/profile");
    }
};

const getDashboard = async (req, res) => {
    try {
        const posts = await Post.find().populate("author").sort({ createdAt: -1 });
        res.render("pages/dashboard", { user: req.user, posts, title: "Dashboard" });
    } catch (error) {
        res.redirect("/");
    }
};

module.exports = {
    getHomePage,
    renderCreatePost,
    createPost,
    viewPost,
    getUserProfile,
    deletePost,
    renderEditPost,
    updatePost,
    getDashboard
};
