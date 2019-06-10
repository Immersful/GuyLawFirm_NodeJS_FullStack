var express                 = require("express"),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    LocalStratagy           = require("passport-local"),
    User                    = require("./dataSchemas/user"),
    Contact                 = require("./dataSchemas/contact"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    flash                   = require('connect-flash'),
    app                     = express();

//connectiong to a specific database
mongoose.connect("mongodb://localhost/LoginApp2");

//using express-session
app.use(require("express-session")({
    secret:"The milk would do that",
    resave: false,
    saveUninitialized: false
}));

//using flash
app.use(flash());

//showing to all templates
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});




    //so body-parser works
app.use(bodyParser.urlencoded({extended: true}));

//making it so express uses the public dir
app.use(express.static("public"));

//setting the view engine to ejs
app.set("view engine", "ejs");


// so passport works
app.use(passport.initialize());
app.use(passport.session());

//authenticated data from the login form
passport.use(new LocalStratagy(User.authenticate()));

//reading the data and encoding it
passport.serializeUser(User.serializeUser());

//reading the data and unencoding it
passport.deserializeUser(User.deserializeUser());


//ROUTES

//Home page
app.get("/", function(req, res){
    res.render("index", {
        currentUser: req.user,
        page_name: "index"
    });
});

//About page
app.get("/about", function(req, res){
    res.render("about", {
        page_name: "about",
        currentUser: req.user
    });
});

//contact Form
app.get("/contact", function(req, res){
    res.render("contact", {
        name: req.body.name,
        page_name: "contact",
        currentUser: req.user
    });
});

//contact Form information
app.post("/contactform", function(req, res){
    //send to an email.....
 });

 //Getting the lawyers name on click for the contact form
app.post("/contact", function(req, res){
    res.render("contact", {
        name: req.body.name,
        page_name: "contact",
        currentUser: req.user
    });
});


// AUTH ROUTES

//show login
app.get("/login", function(req, res){
    req.flash("error", "")
    res.render("Login", {
        page_name: "logIn",
        currentUser: req.user
    });
});

//handle login form data
app.post("/login", passport.authenticate("local",{
    failureRedirect: "/login",
    failureFlash: true,
}) ,function(req, res){
    req.flash("success", "Logged in");
    return res.redirect("/");
});

//Show signup form
app.get("/signup", function(req, res){
    res.render("Signup", {
        //making it so we can call the page signup so we can make it active in navbar
        page_name: "signUp",
        currentUser: req.user
    });
});

//handle signup form data
app.post("/signup", function(req, res){
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
app.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged Out");
    res.redirect("/");
});

app.listen(3000, function(){
    console.log("server started");
});