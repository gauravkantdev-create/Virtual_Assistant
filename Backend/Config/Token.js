import jwt from "jsonwebtoken";

const genToken = (userId) => {
  try {
    // ✅ Generate JWT token
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "10d",
    });

    return token;
  } catch (error) {
    console.error("❌ Error generating token:", error);
    throw new Error("Token generation failed");
  }
};

export default genToken;
