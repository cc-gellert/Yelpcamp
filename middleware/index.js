const Campground = require("../models/campgrounds"), 
 Comment = require("../models/comment"), 
 Review = require("../models/review");

let middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, (err, foundCampground) => {
		if(err || !foundCampground){
			req.flash("error", "Campground not found"); 
			res.redirect("back");
		} else {
			if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
			next();	
			} else {
				req.flash("error", "You don't have permission to do that"); 
				res.redirect("back"); 
			}
		}
	}); 
	} else {
		req.flash("error", "You need to be logged in to do that"); 
		res.redirect("back"); 
	}
};

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, (err, foundComment) => {
		if(err || !foundComment){
			req.flash("error", "Comment not found"); 
			res.redirect("/campgrounds");
		} else {
			if(foundComment.author.id.equals(req.user._id) ||req.user.isAdmin){
			next();	
			} else {
				req.flash("error", "You do not have permission to change someone else's comment"); 
				res.redirect("back"); 
			}
		}
	}); 
	} else {
		res.redirect("back"); 
	}
};

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                let foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/campgrounds/" + foundCampground._id);
                }
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please login first"); 
	res.redirect("/login");
};

module.exports = middlewareObj; 