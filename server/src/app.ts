import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import routes from "./routes/index.js";

const app = express();

const FRONTEND_URL =
  process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

app.use("/api/v1", routes);

export default app;