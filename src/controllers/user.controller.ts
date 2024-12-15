import { User } from "@/entities/User.entity";
import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  const { email, password, nickname } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    email,
    password: hashedPassword,
    nickname,
  });
  res.status(201).json(newUser);
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Logout successful" });
};
