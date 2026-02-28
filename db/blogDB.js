const mongoose = require("mongoose");

const connectDB = () => {
    mongoose.connect("mongodb://localhost:27017/blog")
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.log(err));
}

module.exports = connectDB;
