const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const WrapAsync = require("./utils/WrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"public")));

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
.then(() => {
    console.log("Database connected"); 
})
.catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
};

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

app.get("/", (req,res) => {
    res.send("Welcome ! Find the best house for your stay.")

})
app.get("/listings" , async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs" , {allListings});
});

app.get("/listings/new" , (req,res) => {
    res.render("listings/new.ejs");
});

app.get("/listings/:id" , async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs" , {listing});

});


app.get("/listings/:id/edit" , async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , {listing});

});

// Update
app.put("/listings/:id" ,validateListing, WrapAsync(async(req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

// Create 
app.post("/listings/new" ,validateListing ,  WrapAsync(async (req,res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
}));

// Delete Route
app.delete("/listings/:id" , WrapAsync(async(req,res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// Review Route
app.post("/listings/:id/reviews" ,validateReview, WrapAsync( async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    console.log("review send");
    res.redirect(`/listings/${req.params.id}`);

}));

app.delete("/listings/:id/reviews/:reviewId" , WrapAsync(async(req,res) => {
    let {id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}});
    await Review.findOneAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

app.use((req, res,next ) => {
    next(new ExpressError(404 ,"page not found"));  
});

app.use((err,req,res,next) => {
    let {statusCode=500 , message="something went wrong"} = err;
    res.status(statusCode).render("error.ejs" ,  {message , statusCode});
});

app.listen(3000 , () => {
    console.log("Server Started");
});