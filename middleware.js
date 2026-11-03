const Listing = require("./models/listing.js");

// Authentication middleware
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in first!");
        return res.redirect("/login");
    }

    next();
};

// Authorization middleware
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Check whether logged-in user owns the listing
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not authorized to modify this listing!");
        return res.redirect(`/listings/${id}`);
    }

    next();
};
