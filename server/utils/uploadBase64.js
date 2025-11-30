import cloudinary from "../config/cloudinary.js";

const uploadBase64Image = async (imageBase64, folder = "smartlearn/posts") => {
  try {
    const uploaded = await cloudinary.uploader.upload(imageBase64, {
      folder,
      resource_type: "image",
    });

    return {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    };
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw err;
  }
};

export default uploadBase64Image;
