import { ITokenUserData } from "@/types/entities";

declare global {
  namespace Express {
    interface Request {
      user?: ITokenUserData;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}
