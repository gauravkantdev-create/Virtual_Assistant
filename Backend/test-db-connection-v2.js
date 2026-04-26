import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Trying the old working host with the new password
const oldHostUrl = "mongodb://gauravhere1731_db_user:Gaurav123shikha@ac-bsnubi6-shard-00-00.kmq529i.mongodb.net:27017,ac-bsnubi6-shard-00-01.kmq529i.mongodb.net:27017,ac-bsnubi6-shard-00-02.kmq529i.mongodb.net:27017/VirtualAssistant?ssl=true&authSource=admin&replicaSet=atlas-l10cvn-shard-0&appName=Cluster0";

console.log("Testing connection with old host format and new password...");

const connect = async () => {
    try {
        await mongoose.connect(oldHostUrl, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("✅ SUCCESS: Database connected with old host format!");
        process.exit(0);
    } catch (error) {
        console.error("❌ FAILURE: Database connection error with old host format:");
        console.error(error.message);
        process.exit(1);
    }
};

connect();
