const multer = require("multer");
const { storage } = require("./utils/cloundinaryauth");
const upload = multer({
  storage: storage,
});

module.exports = upload;
