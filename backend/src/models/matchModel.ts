import { PoolClient } from "pg";
import { pool } from "../../db.js";
import { User } from "../types/User.js";
import { Match } from "../types/Match.js";

const getPendingUser = async (userId: number) => {
  const res = await pool.query(
    `SELECT * FROM participants WHERE user_id = $1 AND status = $2`,
    [userId, "pending"],
  );

  return res.rows[0];
};

const getEnrolledUser = async (userId: number) => {
  const res = await pool.query(
    `
    SELECT scheduled_at
    FROM participants
    INNER JOIN matches ON participants.match_id = matches.id
     WHERE participants.user_id = $1
       AND matches.scheduled_at > NOW()
    `,
    [userId],
  );

  return res.rows[0];
};

const enrollUser = async (userId: number): Promise<void> => {
  await pool.query(`INSERT INTO participants (user_id) VALUES ($1)`, [userId]);
};

const getAssignableParticipantsCount = async (
  client: PoolClient,
): Promise<number> => {
  const res = await client.query(
    `SELECT COUNT(user_id) FROM participants WHERE status = $1`,
    ["pending"],
  );

  let limit = parseInt(res.rows[0].count);

  return limit % 2 !== 0 ? limit - 1 : limit;
};

const getPendingParticipantsToAssign = async (
  limit: number,
  client: PoolClient,
): Promise<User[]> => {
  const res = await client.query(
    `
    SELECT u.*
    FROM users u
    INNER JOIN participants p ON u.id = p.user_id
    WHERE p.status = $1
    ORDER BY p.created_at ASC
    LIMIT $2
  `,
    ["pending", limit],
  );

  return res.rows;
};

const createMatchup = async (
  client: PoolClient,
  days?: number,
): Promise<number> => {
  const now = new Date();
  const scheduledAt = new Date(
    now.getTime() + (days ?? 0) * 24 * 60 * 60 * 1000,
  );

  if (days === undefined) scheduledAt.setMinutes(scheduledAt.getMinutes() + 3);

  const res = await client.query(
    `
    INSERT INTO matches(scheduled_at) 
    VALUES ($1)
    RETURNING id
  `,
    [scheduledAt],
  );

  return res.rows[0].id;
};

const assignParticipantToMatch = async (
  userId: number,
  matchId: number,
  client: PoolClient,
): Promise<void> => {
  await client.query(
    `
    UPDATE participants
    SET match_id = $1,
        status = $2
    WHERE id = (
      SELECT id
      FROM participants
      WHERE user_id = $3
      ORDER BY created_at DESC
      LIMIT 1
    )
    RETURNING *
  `,
    [matchId, "assigned", userId],
  );
};

const getUsersMatch = async (userId: number): Promise<Match | null> => {
  const res = await pool.query(
    `
    SELECT match_id, scheduled_at 
    FROM participants 
    INNER JOIN matches ON participants.match_id = matches.id
    WHERE participants.user_id = $1 AND matches.scheduled_at > NOW()
    `,
    [userId],
  );

  return (res.rows[0] as Match) ?? null;
};

export default {
  getPendingUser,
  enrollUser,
  getEnrolledUser,
  getAssignableParticipantsCount,
  getPendingParticipantsToAssign,
  createMatchup,
  assignParticipantToMatch,
  getUsersMatch,
};
