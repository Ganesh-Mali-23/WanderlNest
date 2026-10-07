const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema } = require("./schema.js");
const {reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error" , "you must logged in to create new listing");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    console.log(listing.owner);
    console.log(res.locals.currUser);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error" , "you don't have permission");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isAuthor = async (req,res,next) => {
    let {id , reviewId} = req.params;
    let review = await Review.findById(reviewId);
    console.log(review.author);
    console.log(res.locals.currUser);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error" , "you don't have permission");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = (req,res,next) => {
    console.log(req.body);
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
};

module.exports.validateReview = (req,res,next) => {
    console.log(req.body);
    let {error} = reviewSchema.validate(req.body.Review);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400 , errMsg);
    }else{
        next();
    }
};