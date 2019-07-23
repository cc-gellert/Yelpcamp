var express = require("express");
var router = express.Router(); 
var passport = require("passport"); 
var User = require("../models/user"); 
var middleware = require("../middleware"); 

router.get("/", function(req, res){
    res.render("landingPage");
});

//auth routes
router.get("/register", (req, res) => {
	res.render("register"); 
});

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
	if(req.body.adminCode === "34ekrQcZmkcio56akld"){
		newUser.isAdmin = true;
	} 
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.render('/register');
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect("/campgrounds"); 
        });
    });
});

//show login form
router.get("/login", (req, res) => {
		res.render("login"); 
});
//login routes
router.post("/login", passport.authenticate("local", 
	{
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
	}), (req, res) => {
});

//logout routes
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "You are now logged out");
	res.redirect("/campgrounds"); 
});


module.exports = router; 