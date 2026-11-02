const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./utils/expressError");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");

const sessionOption ={
    secret : "secretCode",
    resave : false ,
    saveUninitialized : true,
    cookie :{
        expires : Date.now() + 1000*60*60*24*3,
        maxAge : 1000*60*60*24*3,
        httpOnly : true
    }
};
app.use(session(sessionOption));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});
// Import Routes
const listingRoutes = require("./routes/listing.js");
const reviewRoutes = require("./routes/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// EJS Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Root Route
app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

// Listing Routes
app.use("/listings", listingRoutes);

// Review Routes
app.use("/listings", reviewRoutes);

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
