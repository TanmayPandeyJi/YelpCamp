
var express = require("express");
var router = express.Router();
var Campground = require("../models/campground")

router.get("/campgrounds",function(req,res){
	
	Campground.find({},function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render("campgrounds/index", {campgrounds:allCampgrounds, currentUser: req.user, page: "campgrounds"});
		}
	});
});


router.post("/campgrounds", isLoggedIn ,function(req,res){
	var name= req.body.name;
	var image= req.body.image;
	var description= req.body.description;
	var author= req.body.author;
	var price= req.body.price;
	
	Campground.create({
	name: name, 
	image: image,
	description: description,
	author: author,
	price: price
}, function(err, campground){
	if(err){
		console.log(err);
	}
	else{
		res.redirect("/campgrounds");
	}
})

	
});

router.get("/campgrounds/new", isLoggedIn ,function(req,res){
	res.render("campgrounds/new");
});

router.get("/campgrounds/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
		console.log(err);
	} else {
		res.render("campgrounds/show", {campground: foundCampground});
	}
	});
});

router.get("/campgrounds/:id/edit", checkCampgroundOwnership,function(req, res){
	
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err);
		} else{
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
});

router.put("/campgrounds/:id", checkCampgroundOwnership ,function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
	res.redirect("/campgrounds")
		}else{
			req.flash("success","Campground edited successfully!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});


router.delete("/campgrounds/:id", checkCampgroundOwnership ,function(req, res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		}else{
			req.flash("success","Campground deleted!");
			res.redirect("/campgrounds");
		}
	});
});

function checkCampgroundOwnership(req, res, next){
	if (req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			req.flash("error","Campground not found")
			res.redirect("back");
		} else{
			if(foundCampground.author===req.user.username){
			next();
			} else {
				req.flash("error","You don't have permission to do that!");
				res.redirect("/campgrounds/" + req.params.id);
			}
		}
	});
	} else {
		req.flash("error","You need to be logged in to do that!");
		res.redirect("/campgrounds/" + req.params.id);
	}
}

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","You need to be logged in to do that!");
	res.redirect("/login");
}

module.exports = router;