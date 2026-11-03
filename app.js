
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./utils/expressError");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users.js");

// Session Configuration
const sessionOption = {
    secret: process.env.SESSION_SECRET || "secretCode",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 3,
        httpOnly: true
    }
};

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Import Routes
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js");

// EJS Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// General Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session Middleware
app.use(session(sessionOption));

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Middleware
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Root Route
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

// Listing Routes
app.use("/listings", listingRoutes);

// Review Routes
app.use("/listings", reviewRoutes);

// User Routes
app.use("/", userRoutes);

// 404 Error Handler
app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something went wrong!"
    } = err;

    res.status(statusCode).render("listings/error.ejs", {
        err: { message }
    });
});

// Database Connection
async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    app.listen(8080, () => {
        console.log("Server is listening on port 8080");
    });
}

main().catch((err) => {
    console.error("Database connection failed:", err);
});
