import { generateAccessToken } from "@/config/jwt";
import { ERESPONSE_MESSAGE } from "@/types/enums";
import { ITokenUserData } from "@/types/interfaces";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: ERESPONSE_MESSAGE.TOKEN_REQUIRED });
      return;
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_SECRET!,
      (
        err: jwt.VerifyErrors | null,
        decoded: JwtPayload | string | undefined
      ) => {
        if (err) {
          res.status(401).json({ message: ERESPONSE_MESSAGE.INVALID_TOKEN });
          return;
        }

        const newAccessToken = generateAccessToken({
          id: (decoded as ITokenUserData).id,
          nickname: (decoded as ITokenUserData).nickname,
        });

        res.status(200).json({
          message: ERESPONSE_MESSAGE.TOKEN_REFRESHED,
          accessToken: newAccessToken,
        });
      }
    );
  } catch (error) {
    next(error);
  }
};
