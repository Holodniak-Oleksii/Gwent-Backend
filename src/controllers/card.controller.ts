import CardEntity from "@/entities/Card.entity";
import { NextFunction, Request, Response } from "express";

export const createCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const newCard = await CardEntity.create(req.body);
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
