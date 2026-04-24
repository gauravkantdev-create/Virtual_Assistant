// Controllers/User.controller.js
import User from "../Models/User.model.js";
import uploadOnCloudinary from "../Config/Cloudinary.js";

export const updateAssistant = async (req, res) => {
  try {
    const userId = req.userId;
    const { assistantName } = req.body;

    if (!userId)
      return res.status(401).json({ message: "Unauthorized" });

    if (!assistantName && !req.file)
      return res.status(400).json({ message: "Provide assistant name or image" });

    let assistantImage;

    // ✅ Upload to Cloudinary if image file provided
    if (req.file) {
      const uploaded = await uploadOnCloudinary(req.file.path);
      assistantImage = uploaded?.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(assistantName && { assistantName }),
        ...(assistantImage && { assistantImage }),
      },
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      message: "Assistant updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Assistant update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
