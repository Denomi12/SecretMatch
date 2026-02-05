import express from "express";
import usersRouter from "./src/routes/userRoutes.js";
import matchRouter from "./src/routes/matchRoutes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/users", usersRouter);
app.use("/match", matchRouter);

app.use(errorHandler);

export default app;
