import express from "express";
import { updateAssistant } from "../Controllers/User.Controllers.js";
import isAuth from "../Middleware/IsAuth.js";
import upload from "../Middleware/Multer.js";

const userRouter = express.Router();

// User-specific routes
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);

export default userRouter;