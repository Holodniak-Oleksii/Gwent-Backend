import {
  createCard,
  deleteCard,
  updateCard,
} from "@/controllers/card.controller";
import { Router } from "express";

const router = Router();

router.post("/", createCard);
router.delete("/:id", deleteCard);
router.put("/:id", updateCard);

export default router;
