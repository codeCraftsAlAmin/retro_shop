import { IRequestUserInterface } from "../interfaces/requestUserInterface";

declare global {
  namespace Express {
    interface Request {
      user?: IRequestUserInterface;
    }
  }
}
