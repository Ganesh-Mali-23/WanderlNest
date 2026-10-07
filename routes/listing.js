const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const WrapAsync = require("../utils/WrapAsync.js");
const { isLoggedIn, isOwner , validateListing } = require("../middleware.js");

router.get("/" , async (req,res) => {
    console.log("route reached");
    const allListings = await Listing.find({});
    res.render("listings/index.ejs" , {allListings});
});

router.get("/new" ,isLoggedIn, (req,res) => {
    res.render("listings/new.ejs");
});

router.get("/:id" , async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path : "reviews", populate : {path : "author",}}).populate("owner");
    if(!listing){
        req.flash("error" , "listing does not exist");
        res.redirect("/litings");
    }
    res.render("listings/show.ejs" , {listing});

});

// edit
router.get("/:id/edit" ,isLoggedIn ,validateListing , async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , {listing});

});

// edit/Update
router.put("/:id" ,isLoggedIn ,isOwner ,validateListing, WrapAsync(async(req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    req.flash("success" , "Listing is updated");
    res.redirect(`/listings/${id}`);
}));

// Create 
router.post("/new" ,isLoggedIn ,validateListing ,  WrapAsync(async (req,res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success" , "new listing created");
    res.redirect("/listings");
}));

// Delete Route
router.delete("/:id" ,isLoggedIn,isOwner ,WrapAsync(async(req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success" , "Listing is deleted");
    res.redirect("/listings");
}));

module.exports = router;