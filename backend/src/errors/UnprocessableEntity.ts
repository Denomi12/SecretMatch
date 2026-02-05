import { AppError } from "./AppError.js";

export class UnprocessableEntity extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}
