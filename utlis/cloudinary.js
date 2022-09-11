require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadFiles = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      { upload_preset: "ml_default" },
      (error, result) => {
        if (error) {
          reject(new Error("Serror error."));
        } else {
          resolve(result);
        }
      }
    );
  });
};

const deleteFile = async (filename) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      "1662901573641-Screenshot_86_aabibn",
      (error, result) => {
        if (error) {
          reject(new Error("Serror error."));
        } else {
          resolve(true);
        }
      }
    );
  });
};

const getImgUrl = async (filename) => {
  return cloudinary.url(filename);
};

module.exports = { uploadFiles, deleteFile, getImgUrl };
