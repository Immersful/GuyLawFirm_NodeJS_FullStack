var express                 = require("express"),
    mongoose                = require("mongoose"),
    authRoutes              = require('./routes/authRoutes'),
    profileRoutes           = require('./routes/profileRoutes'),
    indexRoutes             = require('./routes/indexRoutes'),
    bodyParser              = require("body-parser"),
    passport                = require("passport"),
    LocalStratagy           = require("passport-local"),
    User                    = require("./dataSchemas/user"),
    Contact                 = require("./dataSchemas/contact"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    flash                   = require('connect-flash'),
    session                 = require("express-session"),
    methodOverride          = require("method-override"),
    MongoStore              = require('connect-mongo')(session),
    app                     = express();

//connectiong to a specific database
mongoose.connect("mongodb://localhost/LoginApp2", {
    
});

//setting the view engine to ejs
app.set("view engine", "ejs");

//using express-session
app.use(session({
    secret:"The milk would do that",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
         mongooseConnection: mongoose.connection,
         ttl: 7 * 24 * 60 * 60
        })
}));

//maki
app.use(methodOverride('_method'));

//using flash
app.use(flash());

//setting the view engine to ejs
app.set("view engine", "ejs");

//showing to all templates
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.Contact= req.contact 
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

    //so body-parser works
app.use(bodyParser.urlencoded({extended: true}));

//making it so express uses the public dir
app.use(express.static("public"));

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

// Index Routes
app.use("/", indexRoutes);

// Profile Routes
app.use(profileRoutes)

// Auth Routes
app.use("/", authRoutes);

app.listen(3000, function(){
    console.log("server started");
});