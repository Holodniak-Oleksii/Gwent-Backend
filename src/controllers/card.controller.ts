import CardEntity from "@/entities/Card.entity";
import UserEntity from "@/entities/User.entity";
import { EResponseMessage } from "@/types/enums";
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

export const getCards = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cards = await CardEntity.find();

    res.status(200).json({ cards });
  } catch (error) {
    next(error);
  }
};

export const createMultipleCards = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cardDataArray = req.body.map((data: any) => ({
      ...data,
      id: uuidv4(),
    }));

    const newCards = await CardEntity.create(cardDataArray);

    res.status(201).json(newCards);
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

export const getUserCards = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    const user = await UserEntity.findOne({ nickname: req.user.nickname });
    if (!user) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    const cards = await CardEntity.find({ id: { $in: user.cards } });

    res.status(200).json({ cards });
  } catch (error) {
    next(error);
  }
};

export const buyCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    const user = await UserEntity.findOne({ nickname: req.user.nickname });
    if (!user) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    const card = await CardEntity.findOne({ id: req.body.id });

    if (!card) {
      res.status(400).json({ message: EResponseMessage.CARD_NOT_FOUND });
      return;
    }

    await UserEntity.findOneAndUpdate(
      { nickname: req.user.nickname },
      {
        cards: [...user.cards, card.id],
      }
    );

    res.status(200).json({ cards: [...user.cards, card.id] });
  } catch (error) {
    next(error);
  }
};
