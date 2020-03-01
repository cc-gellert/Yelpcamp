const express = require("express"),
 router = express.Router({mergeParams: true}), 
 Campground = require("../models/campgrounds"),
 Comment = require("../models/comment"), 
 passport = require("passport"), 
 User = require("../models/user"),
 middleware = require("../middleware"); 

//Index
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    }); 
});

//Create 
router.post("/", middleware.isLoggedIn, function(req, res){
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
			   req.flash("error", "Something went wrong"); 
               console.log(err);
           } else {
			   comment.author.id = req.user._id; 
			   comment.author.username = req.user.username; 
			   comment.save(); 
               campground.comments.push(comment);
               campground.save();
			   req.flash("success", "Successfully added comment"); 
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});

//Edit
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if (err || !foundCampground){
			req.flash("error", "Cannot find campground");
			return res.redirect("back"); 
		} 
	Comment.findById(req.params.comment_id, (err, foundComment) => {
		if(err) {
		res.redirect("back");
	} else {
		res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
		}
	});
});
}); 

//Update
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/campgrounds/" + req.params.id); 
		}
	}) ;
});

//Destroy
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if(err){
			res.redirect("back"); 
		} else {
			req.flash("success", "Comment deleted"); 
			res.redirect("/campgrounds/" + req.params.id); 
		}
	}); 
});

module.exports = router; 

