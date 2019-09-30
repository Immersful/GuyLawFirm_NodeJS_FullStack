var router = require("express").Router();
var express                 = require("express"),
bodyParser                  = require("body-parser"),
mongoose                    = require("mongoose"),
User                        = require("../dataSchemas/user"),
Contact                     = require("../dataSchemas/contact"),
flash                       = require('connect-flash'),
methodOverride              = require("method-override"),
router                      = express();

//deleting one contact form from db
router.delete("/profile/:id", function(req, res){
    var currentUser = req.user;
    //finding the contact info by id and removing it
   Contact.findByIdAndRemove(req.params.id, function(err){
       if(err) {
           res.redirect("/profile/" + currentUser._id);
       } else {
           req.flash("error", "Deleted Contact Form");
           res.redirect("/profile/" + currentUser._id);
       }
   });
});

//profile 
router.get("/profile/:id", function(req, res){
   //finding the user by id
   User.findById(req.params.id, function(err, foundUser) {
       if(err) {
         req.flash("error", "Something went wrong.");
         return res.redirect("/");
       }
       // finding the contact forms for (one specific user) if the contact forms id matches the users id
       Contact.find().where('duthor.id').equals(foundUser._id).exec(function(err, contacts) {
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
       });
     });
});

//edit profile
router.get("/profile/:id/edit", function(req ,res){

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
router.put("/profile/:id", function(req, res){

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

//edit Avatar
router.get("/profile/:id/edit/avatar", function(req ,res){

    //finding the id to use in the edit template
    User.findById(req.params.id, function(err, foundUser){
        if(err) {
           return res.redirect("/profile/" + req.params.id);
        } else {
            res.render("editAvatar", {
                currentUser: req.user,
                user: foundUser,
                page_name: "profile"
            });
        }
    })
 });
 
 //update profile from edit
 router.put("/profile/:id", function(req, res){
 
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

  //edit Contact form in profile
  router.get("/profile/:id/edit/:cid", function(req, res){
     // ---------------------------
     // req.params IS WHATS IN THE ROUTE 
     // ---------------------------

    //finding the user by id
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
          req.flash("error", "Something went wrong.");
          return res.redirect("/");
        }
        // finding the contact form FOR A SPECIFIC FORMS ID
        Contact.findById(req.params.cid ,function(err, contact) {
          if(err) {
            req.flash("error", "");
            return res.redirect("/");
          }
          //rendering the profile ejs template with the foundusers information and all the contact forms that user has sent
          res.render("editContact", {
              user: foundUser, 
              contact: contact,
              currentUser: req.user,
              page_name: "profile"
            });
        });
      });
 });
 
 //update profile from contact form edit
 router.put("/profile/:id/contact/:cid", function(req, res){
     User.findById(req.params.id, function(err, foundUser){
         if(err) {
             console.log(err);
         } else {
            //rendering the profile ejs template with the foundusers information and all the contact forms that user has sent
            Contact.findByIdAndUpdate(req.params.cid, req.body.contact, function(err, contact) {
                if(err) {
                    req.flash("err", "Can not Update something went wrong")
                    return res.redirect("/profile/" + req.params.id);
                } else {
                    req.flash("success", "Updated Users Information")
                    return res.redirect("/profile/" + req.params.id);
                }
            });
        }
    });
});

module.exports = router;