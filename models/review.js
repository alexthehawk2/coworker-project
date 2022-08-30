const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  body: String,
  rating: Number,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    autopopulate: true,
  },
});
reviewSchema.plugin(require("mongoose-autopopulate"));
module.exports = mongoose.model("Review", reviewSchema);
