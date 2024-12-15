import { ITokenUserData } from "@/types/interfaces";

declare global {
  namespace Express {
    interface Request {
      user?: ITokenUserData;
    }
  }
}
