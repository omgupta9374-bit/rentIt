
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");

    await Listing.deleteMany({});
    console.log("Old listings deleted");

    await Listing.insertMany(initData.data);
    console.log("Sample listings inserted successfully");

    await mongoose.connection.close();
}

main().catch(async (err) => {
    console.log(err);
    await mongoose.connection.close();
});
