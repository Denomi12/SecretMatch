import {
  validateAndLoginUser,
  validateAndRegisterUser,
} from "../services/userService.js";
import { NextFunction, Request, Response } from "express";
import { UserCredentials } from "../types/User.js";
import { NotFoundError } from "../errors/NotFoundError.js";

const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user: UserCredentials = req.body;
    if (!user) throw new NotFoundError("User was not found!");

    const data = await validateAndRegisterUser(user);

    res.status(201).json(data);
  } catch (err: any) {
    next(err);
  }
};

const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user: UserCredentials = req.body;
    if (!user) throw new NotFoundError("User was not found!");

    const data = await validateAndLoginUser(user);

    res.cookie("jwt", data.token, {
      httpOnly: true,
      secure: true,
      maxAge: 1 * 60 * 60 * 1000,
    });

    res.status(201).json(data.existingUser);
  } catch (err: any) {
    next(err);
  }
};

export default { registerUser, loginUser };
