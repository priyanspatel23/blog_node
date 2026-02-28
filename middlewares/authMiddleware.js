const User = require("../models/user");

const setUser = async (req, res, next) => {
    if (req.cookies.userId) {
        try {
            const user = await User.findById(req.cookies.userId);
            req.user = user;
            res.locals.user = user;
        } catch (err) {
            console.log(err);
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }

    // Empty flash arrays for compatibility
    res.locals.success_msg = [];
    res.locals.error_msg = [];

    next();
};

const isLoggedIn = (req, res, next) => {
    if (req.user) {
        return next();
    }
    res.redirect("/login");
}

module.exports = { isLoggedIn, setUser };
