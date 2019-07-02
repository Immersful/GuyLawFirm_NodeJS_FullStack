var express                 = require("express"),
    bodyParser              = require("body-parser"),
    mongoose                = require("mongoose"),
    passport                = require("passport"),
    LocalStratagy           = require("passport-local"),
    User                    = require("./dataSchemas/user"),
    Contact                 = require("./dataSchemas/contact"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    flash                   = require('connect-flash'),
    methodOverride          = require("method-override"),
    app                     = express();

//connectiong to a specific database
mongoose.connect("mongodb://localhost/LoginApp2");

//maki
app.use(methodOverride('_method'))

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

 //Getting the lawyers name on click for the contact form
 app.post("/contact", function(req, res){
    res.render("contact", {
        name: req.body.name,
        page_name: "contact",
        currentUser: req.user
    });
});

//contact Form information
app.post("/contactform", function(req, res){

    //getting the currentUser to get the current users id
    var currentUser = req.user;
    var author = {
        id: currentUser._id
    }
    //getting the currentUser to get the current users id

    //collecting all the data
    var firstName = req.body.firstName;
    var lastname = req.body.lastName;
    var lName = req.body.lName;
    var rFContact = req.body.rFContact;
    var message = req.body.message

    //storing all the data in the variable
    var data = {firstName: firstName, lastName: lastname, lName: lName, rFContact: rFContact, message: message, author: author};
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

 //deleting one contact form from db
 app.delete("/profile/:id", function(req, res){
     var currentUser = req.user;
     //finding the contact info by id and removing it
    Contact.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/profile/" + currentUser._id);
        } else {
            req.flash("success", "Deleted Contact Form");
            res.redirect("/profile/" + currentUser._id);
        }
    });
 });

//profile 
app.get("/profile/:id", function(req, res){
    //finding the user by id
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
          req.flash("error", "Something went wrong.");
          return res.redirect("/");
        }
        // finding the contact forms for (one specific user) if the contact forms id matches the users id
        Contact.find().where('author.id').equals(foundUser._id).exec(function(err, contacts) {
          if(err) {
            req.flash("error", "");
            return res.redirect("/");
          }
          //rendering the profile ejs template with the foundusers information and all the contact forms that user has sent
          res.render("profile", {
              user: foundUser, 
              contact: contacts,
              currentUser: req.user,
              page_name: "profile"
            });
        })
      });
});

//edit profile
app.get("/profile/:id/edit", function(req ,res){

    //finding the id to use in the edit template
    User.findById(req.params.id, function(err, foundUser){
        if(err) {
           return res.redirect("/profile/" + req.params.id);
        } else {
            res.render("edit", {
                currentUser: req.user,
                user: foundUser,
                page_name: "profile"
            });
        }
    })
});

//update profile from edit
app.put("/profile/:id", function(req, res){

    //finding user and updating its informationg from the edit form
    //                     getting the id  getting the form from the edit template
    User.findByIdAndUpdate(req.params.id, req.body.userEdit, function(err, updatedUser){
        if(err) {
            req.flash("err", "Can not Update something went wrong")
            return res.redirect("/profile/" + req.params.id);
        } else {
            req.flash("success", "Updated Users Information")
            return res.redirect("/profile/" + req.params.id);
        }
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