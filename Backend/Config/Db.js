import mongoose from 'mongoose';

const connectDb= async()=>{
    try {
         // Disable buffering so failures throw immediately instead of hanging
         mongoose.set('bufferCommands', false);
         await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
         });
         console.log("✅ Database connected successfully");
    } catch (error) {
        console.log("❌ Database connection failed:", error.message);
        // Do not crash the app immediately for testing, or set up a mock mode
        // For now, let's just log it clearly.
    }
}
 export default connectDb;
 