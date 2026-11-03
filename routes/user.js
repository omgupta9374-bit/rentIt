
const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/users.js");
const wrapAsync = require("../utils/wrapAsync");
router.get("/signup" , async (req,res) =>{
    res.render("../views/user/signUp.ejs");
});
// Signup POST route
router.post("/signup", wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const newUser = new User({
            username,
            email
        });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }

            req.flash("success", "Welcome to RentIt!");
            res.redirect("/listings");
        });

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}));
router.get("/login", (req, res) => {
    res.render("../views/user/login.ejs");
});

router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    (req, res) => {
        req.flash("success", "Welcome back to RentIt!");
        res.redirect("/listings");
    }
);
router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }

        req.flash("success", "You have been logged out successfully!");
        res.redirect("/listings");
    });
});
module.exports = router;