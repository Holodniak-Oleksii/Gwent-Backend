import CardEntity from "@/entities/Card.entity";
import UserEntity from "@/entities/User.entity";
import { EResponseMessage } from "@/types/enums";
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
export const getCards = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cards = await CardEntity.find();

    // await Promise.all(
    //   cards.map((c) =>
    //     CardEntity.findByIdAndUpdate(c._id, {
    //       ...c.toObject(),
    //       price: 100,
    //     })
    //   )
    // );

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
    const cardDataArray = req.body.map((data: any) => data);

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
    if (!req.user?._id) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    const user = await UserEntity.findOne({ nickname: req.user.nickname });
    if (!user) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    const cards = await CardEntity.find({ _id: { $in: user.cards } });

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
    if (!req.user?._id) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    const user = await UserEntity.findOne({ nickname: req.user.nickname });
    if (!user) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    const card = await CardEntity.findById(req.body.id);

    if (!card) {
      res.status(400).json({ message: EResponseMessage.CARD_NOT_FOUND });
      return;
    }

    if (card.price >= user.coins) {
      res.status(400).json({ message: EResponseMessage.NOT_ENOUGH_MONEY });
      return;
    }

    const updatedUser = await UserEntity.findOneAndUpdate(
      { nickname: req.user.nickname },
      {
        cards: [...user.cards, card._id],
        coins: user.coins - card.price,
      },
      { new: true }
    );

    res.status(200).json({
      user: updatedUser,
      message: EResponseMessage.SUCCESSFULLY_PURCHASED,
    });
  } catch (error) {
    next(error);
  }
};
