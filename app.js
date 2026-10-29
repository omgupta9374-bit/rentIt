
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/expressError");
const engine = require("ejs-mate");
const ejsMate = require("ejs-mate");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// EJS setup
app.engine("ejs", ejsMate);
app.engine("ejs", engine);
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

// Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Create Route
app.post("/listings", wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit.ejs", { listing });
}));

// Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { runValidators: true, new: true }
    );

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.redirect(`/listings/${id}`);
}));

// Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/show.ejs", { listing });
}));

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.redirect("/listings");
}));

app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;

    res.status(statusCode).render("listings/error.ejs", {
    err: { message }
});
});
// Connect to DB, then start server
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
