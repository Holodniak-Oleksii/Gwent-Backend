import CardEntity from "@/entities/Card.entity";
import { NextFunction, Request, Response } from "express";

import { v4 as uuidv4 } from "uuid";

export const createCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newCardData = { ...req.body, id: uuidv4() };
    const newCard = await CardEntity.create(newCardData);

    res.status(201).json(newCard);
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await CardEntity.findByIdAndDelete(id);
    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedCard = await CardEntity.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(updatedCard);
  } catch (error) {
    next(error);
  }
};
