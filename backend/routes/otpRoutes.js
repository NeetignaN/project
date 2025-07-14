import { Router } from "express";
import otpController from "../controllers/otpController.js";

const router = Router();

// OTP routes
router.post("/send-otp", otpController.sendOTP.bind(otpController));
router.post("/verify-otp", otpController.verifyOTP.bind(otpController));

export default router;
