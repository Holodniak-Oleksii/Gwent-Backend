import {
  createCard,
  deleteCard,
  getUserCards,
  updateCard,
} from "@/controllers/card.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.post("/", createCard);
router.delete("/:id", deleteCard);
router.put("/:id", updateCard);
router.get("/my", authMiddleware, getUserCards);

export default router;
