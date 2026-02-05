import { pool } from "../../db.js";
import bcrypt from "bcrypt";
import { UserCredentials, User, weekdays } from "../types/User.js";

const addUser = async (user: UserCredentials): Promise<User> => {
  const { name, email, password, preferred_day } = user;

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  const preference = weekdays.includes(preferred_day || "")
    ? preferred_day
    : null;

  const res = await pool.query(
    `INSERT INTO users(name, email, password, preferred_day) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, hashedPassword, preference],
  );

  return res.rows[0];
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return res.rows[0] ?? null;
};

const getUser = async (user: UserCredentials): Promise<User | null> => {
  const { email, password } = user;

  const res = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);

  const existingUser = res.rows[0];
  if (!existingUser) return null;

  const isValidPassword = await bcrypt.compare(password, existingUser.password);

  return isValidPassword ? existingUser : null;
};

export default { addUser, getUserByEmail, getUser };
