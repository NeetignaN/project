import { Router } from "express";
import authController from "../controllers/authController.js";

const router = Router();

// Auth routes
router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));

export default router;
