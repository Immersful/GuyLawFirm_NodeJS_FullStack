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

//Home page
router.get("/", function(req, res){
    res.render("index", {
        currentUser: req.user,
        page_name: "index"
    });
});

//About page
router.get("/about", function(req, res){
    res.render("about", {
        page_name: "about",
        currentUser: req.user
    });
});

 //Getting the lawyers name on click for the contact form
 router.post("/contact", function(req, res){
    res.render("contact", {
        name: req.body.name,
        page_name: "contact",
        currentUser: req.user
    });
});

//contact Form
router.get("/contact", function(req, res){
    res.render("contact", {
        name: req.body.name,
        page_name: "contact",
        currentUser: req.user
    });
});

//contact Form information
router.post("/contactform", function(req, res){

    //getting the currentUser to get the current users id
    var currentUser = req.user;
    var author = {
        id: currentUser._id
    }

    var lawyersMessage = req.body.lawyersMessage;

    //collecting all the data
    var firstName = req.body.firstName;
    var lastname = req.body.lastName;
    var lawyersName = req.body.lawyersName;
    var rFContact = req.body.rFContact;
    var message = req.body.message;

    //storing all the data in the variable
    var data = {firstName: firstName, lastName: lastname, lawyersName: lawyersName, rFContact: rFContact, message: message, author: author, lawyersMessage: lawyersMessage};
    //storing the contact form data in mongodb's database
    Contact.create(data, function(err, contactForm){
        if(err) {
            console.log(err);
        } else {
            //redirecting to the home page if no errors
            res.redirect("/");
        }
    });
 });

 module.exports = router;