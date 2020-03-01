const express = require("express"),
 router = express.Router(), 
 passport = require("passport"), 
 User = require("../models/user"),
 Campground = require("../models/campgrounds"),
 middleware = require("../middleware"),
 Review = require("../models/review"),
 Comment = require("../models/comment");

//INDEX
router.get("/", function (req, res) {
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), "gi");
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                  req.flash("error", "Campground not found");
				  return res.redirect("back"); 
              } 
              res.render("campgrounds/index",{campgrounds:allCampgrounds});
           }
        });
	} else {
		Campground.find({}, function (err, allCampgrounds) {
			if (err) {
				console.log(err);
			} else {
				res.render("campgrounds/index", {campgrounds: allCampgrounds});
			}
		});
	}
}); 

//CREATE
router.post("/", middleware.isLoggedIn, function (req, res) {
    let name = req.body.name;
	let price = req.body.price; 
    let image = req.body.image;
    let desc = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username
    }; 
    let newCampground = {name: name, price: price, image: image, description: desc, author: author};
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/campgrounds");
        }
    });
});

//NEW
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

// SHOW
router.get("/:id", function (req, res) {
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT CAMPGROUND
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    delete req.body.campground.rating;
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DESTROY CAMPGROUND 
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                    campground.remove();
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/campgrounds");
                });
            });
        }
    });
});

function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;