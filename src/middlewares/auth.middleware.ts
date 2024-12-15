import { ERESPONSE_MESSAGE } from "@/types/enums";
import { ITokenUserData } from "@/types/interfaces";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: ERESPONSE_MESSAGE.TOKEN_REQUIRED });
      return;
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        res.status(403).json({ message: ERESPONSE_MESSAGE.INVALID_TOKEN });
        return;
      }
      req.user = decoded as ITokenUserData;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: ERESPONSE_MESSAGE.SERVER_ERROR });
  }
};

export default authMiddleware;
