import {
  generateRefillCode,
  getAllPlayers,
  getProfile,
  getUserByNickname,
  login,
  register,
  uploadAvatar,
} from "@/controllers/user.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import { uploadMiddleware } from "@/middlewares/upload.middleware";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/info/:nickname", authMiddleware, getUserByNickname);
router.get("/all", authMiddleware, getAllPlayers);
router.get("/profile", authMiddleware, getProfile);
router.post("/generate-refill-code", authMiddleware, generateRefillCode);
router.post("/avatar", authMiddleware, uploadMiddleware, uploadAvatar);

export default router;
