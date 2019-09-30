var router = require("express").Router();
var express                 = require("express"),
bodyParser                  = require("body-parser"),
mongoose                    = require("mongoose"),
passport                    = require("passport"),
LocalStratagy               = require("passport-local"),
User                        = require("../dataSchemas/user"),
Contact                     = require("../dataSchemas/contact"),
passportLocalMongoose       = require("passport-local-mongoose"),
flash                       = require('connect-flash'),
methodOverride              = require("method-override"),
app                         = express();

// AUTH ROUTES

//show login
router.get("/login", function(req, res){
    req.flash("error", "")
    res.render("Login", {
        page_name: "logIn",
        currentUser: req.user
    });
});

//handle login form data
router.post("/login", passport.authenticate("local",{
    failureRedirect: "/login",
    failureFlash: true,
}) ,function(req, res){
    req.flash("success", "Logged in");
    return res.redirect("/");
});

//Show signup form
router.get("/signup", function(req, res){
    res.render("Signup", {
        //making it so we can call the page signup so we can make it active in navbar
        page_name: "signUp",
        currentUser: req.user
    });
});

//handle signup form data
router.post("/signup", function(req, res){
    User.register(new User({firstName: req.body.firstName, lastName: req.body.lastName, username: req.body.username, email: req.body.email}), req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message);
            return res.redirect("/signup");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Successfuly Signed up");
            return res.redirect("/");
        });
    });
});

//logout 
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged Out");
    res.redirect("/");
});


module.exports = router;