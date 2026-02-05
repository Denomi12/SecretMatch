import { AuthError } from "../errors/AuthError.js";
import { User } from "../types/User.js";
import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET_KEY) {
  throw new AuthError("JWT_SECRET_KEY is not defined");
}

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export const generateJWT = (payload: Omit<User, "password">) => {
  console.log("payload: ", payload);

  const token = jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: "1h",
  });

  return token;
};
