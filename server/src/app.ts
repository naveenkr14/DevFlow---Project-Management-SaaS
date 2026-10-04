import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { env } from "./config/env.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/error-handler.js";
import routes from "./routes/index.js";

const app = express();

// Set TRUST_PROXY_HOPS to the exact number of trusted reverse proxies.
// The default of zero does not trust forwarded headers.
app.set("trust proxy", env.trustProxyHops);

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: "100kb" }));

app.use(cookieParser());

app.use("/api/v1", routes);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
