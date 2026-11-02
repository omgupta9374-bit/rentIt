
const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/expressError");
const { validateReview } = require("../middleware/review");

// Create Review Route
// Create Review Route
router.post("/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    const newReview = new Review(req.body.review);

    await newReview.save();

    listing.reviews.push(newReview._id);
    await listing.save();

    req.flash("success", "Review Submitted Successfully!");

    res.redirect(`/listings/${listing._id}`);
}));

module.exports = router;
