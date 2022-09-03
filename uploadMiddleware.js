const multer = require("multer");

const upload = multer({
  limits: {
    fileSize: 9.5 * 1024 * 1024,
  },
});

module.exports = upload;
