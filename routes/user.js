const express = require("express");
const WrapAsync = require("../utils/WrapAsync");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user.js");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup" , (req,res) => {
    res.render("users/signup.ejs");
});

router.post("/signup",saveRedirectUrl ,WrapAsync(async(req ,res) => {
    try{
        let {username , email , password} = req.body;
        const newuser = new User({email , username});
        const registeredUser = await User.register(newuser,password);
        req.login(registeredUser , (err) => {
        if(err){
            return next(err);
        }
        req.flash("sucess" , "Welcome to Wandernest");
        let redirectUrl = res.locals.redirectUrl || "/listings" ;
        res.redirect(redirectUrl);
        });      
    }catch(e){
        req.flash("error" , e.message);
        res.redirect("/signup");
    }
}));

router.get("/login" , (req,res) => {
    res.render("users/login.ejs");
});

router.post("/login" , saveRedirectUrl , passport.authenticate("local" , {failureRedirect: "/login",failureFlash : true,}) , async(req,res) => {
    req.flash("success" , "Welcome back to wandernest!");    
    let redirectUrl = res.locals.redirectUrl || "/listings" ;
    res.redirect(redirectUrl);
});

router.get("/logout" , async(req,res) => {
    req.logOut((err) => {
        if(err){
            return next(err);
        }
        req.flash("error" , "You Logged Out");
        res.redirect("/listings");
    });
});

module.exports = router;