const express = require("express");
const router = express.Router({ mergeParams : true});
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const WrapAsync = require("../utils/WrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");

const validateReview = (req,res,next) => {
    console.log(req.body);
    let {error} = reviewSchema.validate(req.body.Review);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
};


// Review Route
router.post("/" ,validateReview, WrapAsync( async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    console.log("review send");
    req.flash("success" , "New Review is Created");
    res.redirect(`/listings/${req.params.id}`);

}));

router.delete("/:reviewId" , WrapAsync(async(req,res) => {
    let {id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}});
    await Review.findOneAndDelete(reviewId);
    req.flash("success" , "Review is deleted");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;