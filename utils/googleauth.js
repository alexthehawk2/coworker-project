const { google } = require("googleapis");
const fs = require("fs");
const CLIENT_ID =
  "1070837945493-tnruq1v8aspr14iarop83f6l8if00t5m.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";

const REFRESH_TOKEN =
  "1//04L38DUJDKo7ECgYIARAAGAQSNwF-L9IrFVE1_fFBm1mVVsUwPaD3261uNqouHWqMRZb2eXQT9RwaGy63KUbPNK03J0XWkIwTP-s";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

module.exports.uploadImage = async (filePath) => {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: "sample.jpg",
        mimeType: "image/jpg",
      },
      media: {
        mimeType: "image/jpg",
        body: fs.createReadStream(filePath),
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error.message);
  }
};
module.exports.generatePublicUrl = async (fileId) => {
  try {
    const response = await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const result = await drive.files.get({
      fileId: fileId,
      fields: "webViewLink",
    });
    console.log(result.data);
  } catch (error) {
    console.log(error.message);
  }
};
