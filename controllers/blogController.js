const Post = require("../models/post");

/* ===== HOME - GET ALL POSTS ===== */
const index = async (req, res) => {
    try {
        const posts = await Post.find().populate("author").sort({ createdAt: -1 });
        res.render("index", { user: req.user, posts, title: "Home" });
    } catch (err) {
        console.log(err);
        res.render("index", { user: req.user, posts: [], error_msg: "Failed to fetch blogs" });
    }
};

/* ===== CREATE POST PAGE ===== */
const create = (req, res) => {
    res.render("pages/create-blog", { user: req.user, title: "Write Blog" });
};

/* ===== CREATE POST - SUBMIT ===== */
const store = async (req, res) => {
    try {
        const { title, content } = req.body;

        // Handle file path if image was uploaded
        let imageUrl = undefined;
        if (req.file) {
            imageUrl = "/uploads/" + req.file.filename;
        }

        await Post.create({
            title,
            content,
            imageUrl: imageUrl || undefined,
            author: req.user._id
        });
        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.redirect("/create");
    }
};

/* ===== SINGLE POST DETAILS ===== */
const show = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate("author");
        if (!post) {
            return res.redirect("/");
        }
        res.render("pages/post-details", { user: req.user, post, title: post.title });
    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
};

/* ===== USER PROFILE - USER POSTS ===== */
const profile = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
        res.render("pages/profile", { user: req.user, posts, title: "My Profile" });
    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
};

/* ===== DELETE POST ===== */
const destroy = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.redirect("/profile");
        }

        // Authorization check
        if (post.author.toString() !== req.user._id.toString()) {
            return res.redirect("/profile");
        }

        await Post.findByIdAndDelete(req.params.id);
        req.flash("success", "Blog deleted successfully. 👋");
        res.redirect("/profile");
    } catch (err) {
        console.log(err);
        res.redirect("/profile");
    }
};

/* ===== EDIT POST PAGE ===== */
const edit = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || post.author.toString() !== req.user._id.toString()) {
            return res.redirect("/profile");
        }
        res.render("pages/edit-blog", { user: req.user, post, title: "Edit Blog" });
    } catch (err) {
        console.log(err);
        res.redirect("/profile");
    }
};

/* ===== UPDATE POST ===== */
const update = async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post || post.author.toString() !== req.user._id.toString()) {
            req.flash("error", "Unauthorized action.");
            return res.redirect("/profile");
        }

        let updateData = { title, content };
        if (req.file) {
            updateData.imageUrl = "/uploads/" + req.file.filename;
        }

        await Post.findByIdAndUpdate(req.params.id, updateData);
        res.redirect("/profile");
    } catch (err) {
        console.log(err);
        res.redirect("/profile");
    }
};

const dash = async (req, res) => {
    try {
        const posts = await Post.find().populate("author").sort({ createdAt: -1 });
        res.render("pages/dashboard", { user: req.user, posts, title: "Management Dashboard" });
    } catch (err) {
        console.log(err);
        res.redirect("/");
    }
};

module.exports = {
    index,
    create,
    store,
    show,
    profile,
    destroy,
    edit,
    update,
    dash
};
