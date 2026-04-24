import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (filePath) => {
  // Configuration
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath);
    fs.unlinkSync(filePath); // Delete the local file after upload
    return { url: uploadResult.secure_url };
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete the local file in case of error
    }
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};

export default uploadOnCloudinary;