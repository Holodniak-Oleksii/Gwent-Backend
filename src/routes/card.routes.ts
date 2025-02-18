import {
  buyCard,
  createCard,
  createMultipleCards,
  deleteCard,
  getCards,
  getUserCards,
  updateCard,
} from "@/controllers/card.controller";
import authMiddleware from "@/middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.post("/", createCard);
router.get("/", getCards);
router.post("/create", createMultipleCards);
router.delete("/:id", deleteCard);
router.put("/:id", updateCard);
router.get("/my", authMiddleware, getUserCards);
router.post("/buy", authMiddleware, buyCard);

export default router;
