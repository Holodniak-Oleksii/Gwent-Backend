import { login, logout, register } from "@/controllers/user.controller";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
