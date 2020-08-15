const mongoose = require("mongoose");
module.exports = mongoose.model("adverts", {
  advert: String,
  category: {
    type: [String],
    default: ["other"],
  },
  date: {
    type: String,
    default: new Date().toISOString(),
  },
  price: Number,
  place: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
});
