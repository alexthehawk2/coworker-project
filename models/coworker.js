const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const coworkerSchema = new Schema({
  title: String,
  image: String,
  price: {
    type: Number,
  },
  description: String,
  location: String,
  spaceOwner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

coworkerSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Coworker", coworkerSchema);
