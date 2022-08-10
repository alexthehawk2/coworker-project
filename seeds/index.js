const mongoose = require("mongoose");
const coworker = require("../models/coworker");
const { descriptors, places } = require("./seedHelpers");
const cities = require("./cities");
mongoose.connect("mongodb://localhost:27017/coworker").then(() => {
  console.log("database connected");
});
const seedDb = async () => {
  for (let i = 0; i < 50; i++) {
    const random = Math.floor(Math.random() * 1001);
    const randomDesc = Math.floor(Math.random() * descriptors.length + 1);
    const randomPlace = Math.floor(Math.random() * places.length + 1);
    let db = new coworker({
      title: `${descriptors[randomDesc]} ${places[randomPlace]}`,
      location: `${cities[random].city}, ${cities[random].state}`,
    });
    await db.save();
  }
};

seedDb();
