import { PoolClient } from "pg";
import matchModel from "../models/matchModel.js";
import { User, weekdays } from "../types/User.js";
import nodemailer from "nodemailer";

const daysUntilPreferredDay = (preferredDay: string): number => {
  const today = new Date().getDay();
  const targetDayIndex = weekdays.indexOf(preferredDay);

  if (targetDayIndex === -1) return 0;

  const diff = (targetDayIndex - today + 7) % 7;
  return diff;
};

const handlePrefDays = (
  first?: string,
  second?: string,
): number | undefined => {
  if (!first && !second) return undefined;
  if (first && !second) return daysUntilPreferredDay(first);
  if (!first && second) return daysUntilPreferredDay(second);
  if (first && second && first === second) return daysUntilPreferredDay(first);
  return undefined;
};

export const randomShuffleUsers = (userIds: User[]): User[] => {
  const shuffled = [...userIds];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

export const createMatchups = async (users: User[], client: PoolClient) => {
  for (let i = 0; i < users.length - 1; i += 2) {
    let addNumberOfDays: number | undefined;

    addNumberOfDays = handlePrefDays(
      users[i].preferred_day,
      users[i + 1].preferred_day,
    );

    const matchId = await matchModel.createMatchup(client, addNumberOfDays);

    await Promise.all([
      matchModel.assignParticipantToMatch(users[i].id, matchId, client),
      matchModel.assignParticipantToMatch(users[i + 1].id, matchId, client),
    ]);
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_EMAIL,
    pass: process.env.EMAIL_CODE,
  },
});

export const sendEmailsToUsers = async (users: User[]) => {
  const sendPromises = users.map(async (user) => {
    try {
      const info = await transporter.sendMail({
        from: process.env.MY_EMAIL,
        to: user.email,
        subject: "Your match is ready!",
        text: "You were selected for a match!",
      });
      console.log(`Email poslan ${user.email}: ${info.response}`);
      return true;
    } catch (err) {
      console.error(`Napaka pri ${user.email}:`, err);
      return false;
    }
  });

  const results = await Promise.all(sendPromises);

  if (results.includes(false)) {
    throw new Error("Nekateri uporabniki niso prejeli emaila!");
  }
};
