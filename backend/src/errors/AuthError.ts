import { AppError } from "./AppError.js";

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}
