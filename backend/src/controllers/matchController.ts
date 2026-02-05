import { NextFunction, Request, Response } from "express";
import { User } from "../types/User.js";
import {
  assignRandomMatches,
  enrollUserInMatch,
  getMatch,
} from "../services/matchServices.js";
import { NotFoundError } from "../errors/NotFoundError.js";

const joinMatch = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user: User = res.locals.user;
    if (!user) throw new NotFoundError("User was not found!");

    await enrollUserInMatch(user.id);

    res.status(201).json({
      message: "Successfully enrolled in the match queue.",
    });
  } catch (err: any) {
    next(err);
  }
};

const assignMatches = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await assignRandomMatches();

    res.status(201).json({
      message: "Successfully generated matches.",
    });
  } catch (err: any) {
    next(err);
  }
};

const getUsersMatch = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user: User = res.locals.user;
    if (!user) throw new NotFoundError("User was not found!");

    const match = await getMatch(user.id);

    if (!match)
      throw new NotFoundError("This user does not have an upcoming match!");

    res.status(201).json(match);
  } catch (err: any) {
    next(err);
  }
};

export default { joinMatch, assignMatches, getUsersMatch };
