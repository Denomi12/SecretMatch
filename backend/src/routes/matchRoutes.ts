import express from "express";
import matchController from "../controllers/matchController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
const router = express.Router();

//get
router.get("/view", authMiddleware, matchController.getUsersMatch);

//post
router.post("/join", authMiddleware, matchController.joinMatch);
router.post(
  "/assign",
  authMiddleware,
  adminMiddleware,
  matchController.assignMatches,
);

export default router;
