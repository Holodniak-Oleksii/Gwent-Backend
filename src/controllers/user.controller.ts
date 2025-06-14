import cloudinary from "@/config/cloudinary";
import { generateAccessToken, generateRefreshToken } from "@/config/jwt";
import CardEntity from "@/entities/Card.entity";
import RefillEntity from "@/entities/Refill.entity";
import UserEntity from "@/entities/User.entity";
import { EResponseMessage } from "@/types/enums";
import { getCloudinaryPublicId } from "@/utils";
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
      res.status(400).json({ message: EResponseMessage.IS_REQUIRED });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: EResponseMessage.PASSWORD_LENGTH });
      return;
    }

    const existingEmail = await UserEntity.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ message: EResponseMessage.EMAIL_TAKEN });
      return;
    }

    const existingNickname = await UserEntity.findOne({ nickname });
    if (existingNickname) {
      res.status(400).json({ message: EResponseMessage.NICKNAME_TAKEN });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const cards = await CardEntity.find({ isDefault: true });
    const ids = cards.map((card) => card._id);

    const newUser = await UserEntity.create({
      email,
      password: hashedPassword,
      nickname,
      cards: ids,
      createdAt: new Date(),
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      message: EResponseMessage.USER_REGISTERED,
      user: {
        _id: newUser._id,
        email: newUser.email,
        nickname: newUser.nickname,
        avatar: newUser.avatar,
        wins: newUser.wins,
        losses: newUser.losses,
        draws: newUser.draws,
        cards: newUser.cards,
        coins: newUser.coins,
        rating: newUser.rating,
        createdAt: newUser.createdAt,
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

    const user = await UserEntity.findOne({ nickname });
    if (!user) {
      res.status(400).json({ message: EResponseMessage.INVALID_CREDENTIALS });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: EResponseMessage.PASS_INCORRECT });
      return;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      message: EResponseMessage.USER_LOGIN,
      user: {
        _id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        cards: user.cards,
        coins: user.coins,
        rating: user.rating,
        createdAt: user.createdAt,
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
    if (!req.user?._id) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    const user = await UserEntity.findOne({ nickname: req.user.nickname });
    if (!user) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        cards: user.cards,
        coins: user.coins,
        rating: user.rating,
        createdAt: user.createdAt,
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

    const user = await UserEntity.findOne({ nickname });
    if (!user) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    res.status(200).json({
      user: {
        _id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        createdAt: user.createdAt,
        rating: user.rating,
        coins: user.coins,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPlayers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.nickname) {
      res.status(401).json({ message: EResponseMessage.INVALID_CREDENTIALS });
      return;
    }

    const currentUserNickname = req.user.nickname;

    const { name = "", rating, page = "1", size = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const sizeNum = parseInt(size as string, 10);

    const filters: any = {
      nickname: { $ne: currentUserNickname },
    };

    if (typeof name === "string" && name.trim() !== "") {
      filters.nickname = {
        ...filters.nickname,
        $regex: name,
        $options: "i",
      };
    }

    if (rating !== undefined && !isNaN(Number(rating))) {
      filters.rating = { $gte: Number(rating) };
    }

    const total = await UserEntity.countDocuments(filters);

    const users = await UserEntity.find(filters)
      .skip((pageNum - 1) * sizeNum)
      .limit(sizeNum);

    const players = users.map((user) => ({
      _id: user._id,
      nickname: user.nickname,
      avatar: user.avatar,
      rating: user.rating,
    }));

    res.status(200).json({
      players,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const nickname = req.user?.nickname;

    if (!nickname) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: EResponseMessage.FILE_REQUIRED });
      return;
    }
    const user = await UserEntity.findOne({ nickname });

    if (!user) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    if (user.avatar) {
      const publicId = getCloudinaryPublicId(user.avatar);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "avatars",
        public_id: nickname,
        overwrite: true,
      },
      async (error, result) => {
        if (error || !result) {
          res.status(500).json({ message: EResponseMessage.FAILED_TO_UPLOAD });
          return;
        }

        const updatedUser = await UserEntity.findOneAndUpdate(
          { nickname },
          { avatar: result.secure_url },
          { new: true }
        );

        if (!updatedUser) {
          res.status(500).json({ message: EResponseMessage.FAILED_TO_UPLOAD });
          return;
        }

        res.status(200).json({
          message: EResponseMessage.SUCCESSFULLY_UPLOAD,
          avatar: updatedUser.avatar,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};

export const generateRefillCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ message: EResponseMessage.INVALID_CREDENTIALS });
      return;
    }

    const user = await UserEntity.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: EResponseMessage.USER_NOT_FOUND });
      return;
    }

    const code = uuidv4().replace(/-/g, "").slice(0, 8);
    await RefillEntity.create({
      userId: user._id,
      code,
    });

    res.status(200).json({
      message: EResponseMessage.BALANCE_TOPPED_UP,
      code,
    });
  } catch (error) {
    next(error);
  }
};
