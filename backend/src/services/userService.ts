import { ConflictError } from "../errors/ConflictError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { ValidationError } from "../errors/ValidationError.js";
import userModel from "../models/userModel.js";
import { UserCredentials, User } from "../types/User.js";
import { generateJWT } from "../utils/auth.js";

export const validateAndRegisterUser = async (
  user: UserCredentials,
): Promise<{ addedUser: Omit<User, "password"> }> => {
  const { name, email, password } = user;
  if (!name || !email || !password)
    throw new ValidationError("Missing arguments!");

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!emailRegex.test(email))
    throw new ValidationError("Please enter a valid email address!");

  const existingUser = await userModel.getUserByEmail(email);
  if (existingUser)
    throw new ConflictError("User with that email already exists!");

  if (password.length < 8) throw new ValidationError("Password is too short!");

  const newlyAddedUser = await userModel.addUser(user);

  const { password: _, ...userWithoutPassword } = newlyAddedUser;

  return { addedUser: userWithoutPassword };
};

export const validateAndLoginUser = async (
  user: UserCredentials,
): Promise<{ existingUser: Omit<User, "password">; token: string }> => {
  const { email, password } = user;

  if (!email || !password) throw new ValidationError("Missing arguments!");

  const existingUser = await userModel.getUser(user);
  if (!existingUser) throw new ValidationError("Wrong username or password");

  const { password: _, ...userWithoutPassword } = existingUser;

  const token = generateJWT(userWithoutPassword);

  return { existingUser: userWithoutPassword, token };
};
