import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log("Testing connection to:", process.env.MONGODB_URL.replace(/:([^@]+)@/, ":****@"));

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ SUCCESS: Database connected!");
        process.exit(0);
    } catch (error) {
        console.error("❌ FAILURE: Database connection error:");
        console.error(error.message);
        process.exit(1);
    }
};

connect();
