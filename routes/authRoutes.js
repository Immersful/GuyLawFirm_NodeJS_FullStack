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
async                       = require("async"),
nodemailer                  = require("nodemailer"),
crypto                      = require("crypto"),
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

    var newUser = new User({username: req.body.username});
    if(req.body.adminCode === 'Ketchup-Would-Suck') {
      newUser.isAdmin = true;
    }
    User.register(new User({firstName: req.body.firstName, lastName: req.body.lastName, username: req.body.username, email: req.body.email, isAdmin: newUser.isAdmin}), req.body.password, function(err, user){
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

// forgot password
router.get('/forgot', function(req, res) {
    res.render('forgot', {
        page_name: 'logIn'
    });
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "8ae97ad533b7f5",
              pass: "d96bbdd45fe42f"
            }
        });
        var mailOptions = {
          to: user.email,
          from: 'Immersfulflame@gmail.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });

  router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token, page_name: 'logIn'});
    });
  });
  
  router.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "8ae97ad533b7f5",
              pass: "d96bbdd45fe42f"
            }
        });
        var mailOptions = {
          to: user.email,
          from: 'Immersfulflame@gmail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) {
      res.redirect('/');
    });
  });

module.exports = router;