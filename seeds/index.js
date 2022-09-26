require("dotenv").config();
const mongoose = require("mongoose");
const coworker = require("../models/coworker");
const { descriptors, places } = require("./seedHelpers");
const getImage = require("./imageAPI");
const cities = require("./cities");
const uri =
  "mongodb+srv://" +
  process.env.MONGODB_USERNAME_PASSWORD +
  "@cluster0.z6cz7.mongodb.net/coworker?retryWrites=true&w=majority";
mongoose
  .connect(uri)
  .then(console.log("database connected"))
  .catch((err) => {
    console.log("Error ", err);
  });

let imgs = getImage(1).then((data) => {
  imgs = data;
  console.log(imgs.length);
  getImage(2).then((data) => {
    const img = imgs.concat(data);
  });
  deleteDB();
  seedDb(imgs);
});
const seedDb = async (imgArr) => {
  for (let i = 0; i < 10; i++) {
    const random = Math.floor(Math.random() * 450);
    const randomDesc = Math.floor(Math.random() * descriptors.length);
    const randomPlace = Math.floor(Math.random() * places.length);
    const randomImg = Math.floor(Math.random() * imgArr.length);
    const price = Math.floor(Math.random() * 20 + 10);
    let db = new coworker({
      title: `${descriptors[randomDesc]} ${places[randomPlace]}`,
      // image: `${imgArr[randomImg]}`,
      image: [
        {
          url: imgArr[randomImg],
          filename: "NA",
        },
      ],
      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Veniam sequi vitae amet soluta alias commodi natus eos dignissimos similique, dolorum obcaecati debitis eius voluptate perspiciatis aliquam rerum aliquid",
      price: price,
      location: `${cities[random].city}, ${cities[random].state}`,
      geometry: cities[random].geometry,
      spaceOwner: process.env.DEFAULT_SPACE_OWNER,
    });
    await db.save();
    const index = imgArr.indexOf(randomImg);
    if (index > -1) {
      imgArr.splice(index, 1);
    }
  }
  mongoose.connection.close();
};
const deleteDB = async () => {
  await coworker.deleteMany({});
  console.log("Database cleared");
};
