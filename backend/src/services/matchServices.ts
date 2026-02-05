import { ConflictError } from "../errors/ConflictError.js";
import matchModel from "../models/matchModel.js";
import { pool } from "../../db.js";
import { UnprocessableEntity } from "../errors/UnprocessableEntity.js";
import {
  createMatchups,
  randomShuffleUsers,
  sendEmailsToUsers,
} from "../utils/matchUtils.js";
import { Match } from "../types/Match.js";

export const enrollUserInMatch = async (userId: number): Promise<void> => {
  const isUserPending = await matchModel.getPendingUser(userId);
  if (isUserPending) throw new ConflictError("User is already enrolled!");

  const isUserEnrolled = await matchModel.getEnrolledUser(userId);
  if (isUserEnrolled) throw new ConflictError("User is already enrolled!");

  await matchModel.enrollUser(userId);
};

export const assignRandomMatches = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const limit = await matchModel.getAssignableParticipantsCount(client);
    if (limit < 2)
      throw new UnprocessableEntity("Not enough players to create a match");

    const pendingUsers = await matchModel.getPendingParticipantsToAssign(
      limit,
      client,
    );

    const shuffledUsers = randomShuffleUsers(pendingUsers);

    await createMatchups(shuffledUsers, client);

    await sendEmailsToUsers(shuffledUsers);

    await client.query("COMMIT");
  } catch (err: any) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getMatch = async (userId: number): Promise<Match | null> => {
  const match = await matchModel.getUsersMatch(userId);

  return match;
};
