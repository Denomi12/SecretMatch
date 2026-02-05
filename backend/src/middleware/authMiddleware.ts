import { NextFunction, Request, Response } from "express";
import { AuthError } from "../errors/AuthError.js";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies?.jwt;

  if (!token) throw new AuthError("User is not authorised for this action");

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as JwtPayload;

  res.locals.user = decoded;

  next();
};
