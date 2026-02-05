import { NextFunction, Request, Response } from "express";
import { User, UserRole } from "../types/User.js";
import { AuthError } from "../errors/AuthError.js";

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const user: User = res.locals.user;

  if (!user || user.role !== UserRole.ADMIN)
    throw new AuthError("User is not authorised for this action!");

  next();
};
