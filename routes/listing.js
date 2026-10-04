const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const WrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema } = require("../schema.js");

const validateListing = (req,res,next) => {
    console.log(req.body);
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
};

router.get("/" , async (req,res) => {
    console.log("route reached");
    const allListings = await Listing.find({});
    res.render("listings/index.ejs" , {allListings});
});

router.get("/new" , (req,res) => {
    res.render("listings/new.ejs");
});

router.get("/:id" , async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error" , "listing does not exist");
        res.redirect("/litings");
    }
    res.render("listings/show.ejs" , {listing});

});

router.get("/:id/edit" , async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , {listing});

});

// Update
router.put("/:id" ,validateListing, WrapAsync(async(req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    req.flash("success" , "Listing is updated");
    res.redirect(`/listings/${id}`);
}));

// Create 
router.post("/new" ,validateListing ,  WrapAsync(async (req,res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success" , "new listing created");
    res.redirect("/listings");
}));

// Delete Route
router.delete("/:id" , WrapAsync(async(req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success" , "Listing is deleted");
    res.redirect("/listings");
}));

module.exports = router;