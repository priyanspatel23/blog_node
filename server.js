const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const connectDB = require("./db/blogDB");
const authRouter = require("./routes/authRouter");
const blogRouter = require("./routes/blogRouter");
const { setUser } = require("./middlewares/authMiddleware");

const app = express();

connectDB();

// View engine
app.set("view engine", "ejs");

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// Session & Flash
app.use(session({
  secret: 'luxblog_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 * 60 * 24 } // 24 hours
}));
app.use(flash());

// Global Variables for Flash Messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

// Set User Middleware
app.use(setUser);

// Routes
app.use("/", blogRouter);
app.use("/", authRouter);

// Server 
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
