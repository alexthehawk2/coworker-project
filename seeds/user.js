const User = require("../models/user");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/coworker").then(() => {
  console.log("database connected");
});

User.register({ username: "alex", active: false }, "123");
