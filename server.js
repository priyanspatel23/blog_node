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

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.use(session({
  secret: 'luxblog_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 * 60 * 24 }
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

app.use(setUser);

app.use("/", blogRouter);
app.use("/", authRouter);

app.listen(3000, () => {
  console.log("App listening on port 3000");
});
