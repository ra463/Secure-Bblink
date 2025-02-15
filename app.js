const express = require("express");
const cors = require("cors");
const app = express();
const { error } = require("./middlewares/error.js");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const dotenv = require("dotenv");

dotenv.config({
  path: "./config/config.env",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
const rateLimiter = rateLimit({
  windowMs: process.env.TIME,
  max: process.env.MAX,
  message: "Too many requests from this IP, please try again later.",
  headers: false,
});
app.use(rateLimiter);
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// import routes
const userRoutes = require("./routes/userRoutes.js");

//import validators
const userValidator = require("./validator/userValidator.js");

// use routes
app.use("/api/user", userValidator, userRoutes);

app.get("/", (req, res) =>
  res.send(`<h1>Its working. Click to visit Link.</h1>`)
);

app.all("*", (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
app.use(error);
