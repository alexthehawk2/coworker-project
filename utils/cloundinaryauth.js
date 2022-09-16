const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "alexthehawk",
  api_key: "689199317793797",
  api_secret: "jXyBFTPzNzMsMCYE1s-rdJDkYOY",
});
module.exports.storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "test",
    format: async (req, file) => "jpg",
  },
});
