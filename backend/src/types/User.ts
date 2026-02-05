export interface UserCredentials {
  name: string;
  email: string;
  password: string;
  preferred_day?: string;
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export interface User extends UserCredentials {
  id: number;
  role: UserRole;
}

export const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
