import { generateAccessToken, generateRefreshToken } from "@/config/jwt";
import { User } from "@/entities/User.entity";
import { ERESPONSE_MESSAGE } from "@/types/enums";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password || !nickname) {
      res.status(400).json({ message: ERESPONSE_MESSAGE.IS_REQUIRED });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: ERESPONSE_MESSAGE.PASSWORD_LENGTH });
      return;
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ message: ERESPONSE_MESSAGE.EMAIL_TAKEN });
      return;
    }

    const existingNickname = await User.findOne({ nickname });
    if (existingNickname) {
      res.status(400).json({ message: ERESPONSE_MESSAGE.NICKNAME_TAKEN });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      nickname,
      id: uuidv4(),
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      message: ERESPONSE_MESSAGE.USER_REGISTERED,
      user: {
        id: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
        avatar: newUser.avatar,
        wins: newUser.wins,
        losses: newUser.losses,
        draws: newUser.draws,
        cards: newUser.cards,
        coins: newUser.coins,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nickname, password } = req.body;

    const user = await User.findOne({ nickname });
    if (!user) {
      res.status(400).json({ message: ERESPONSE_MESSAGE.INVALID_CREDENTIALS });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: ERESPONSE_MESSAGE.PASS_MISS_MACH });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      message: ERESPONSE_MESSAGE.USER_LOGIN,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        cards: user.cards,
        coins: user.coins,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(404).json({ message: ERESPONSE_MESSAGE.USER_NOT_FOUND });
      return;
    }

    const user = await User.findOne({ nickname: req.user.nickname });
    if (!user) {
      res.status(404).json({ message: ERESPONSE_MESSAGE.USER_NOT_FOUND });
      return;
    }

    res.status(200).json({
      user: {
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        cards: user.cards,
        coins: user.coins,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByNickname = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { nickname } = req.params;

    const user = await User.findOne({ nickname });
    if (!user) {
      res.status(404).json({ message: ERESPONSE_MESSAGE.USER_NOT_FOUND });
      return;
    }

    res.status(200).json({
      user: {
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        cards: user.cards,
        coins: user.coins,
      },
    });
  } catch (error) {
    next(error);
  }
};
