const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");


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



app.listen(3000 , () => {
    console.log("Server Started");
});