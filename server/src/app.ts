import { existsSync } from "node:fs";
import { resolve } from "node:path";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { env } from "./config/env.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/error-handler.js";
import routes from "./routes/index.js";

const app = express();
const clientDistPath = resolve(__dirname, "../../client/dist");
const clientIndexPath = resolve(clientDistPath, "index.html");
const isApiPath = (path: string) =>
  path === "/api/v1" || path.startsWith("/api/v1/");

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

app.use(
  express.static(clientDistPath, {
    index: false,
    setHeaders: (response, filePath) => {
      const isHashedAsset = /[\\/]assets[\\/]/.test(filePath);

      response.setHeader(
        "Cache-Control",
        env.isProduction && isHashedAsset
          ? "public, max-age=31536000, immutable"
          : "no-cache",
      );
    },
  }),
);

app.use((req, res, next) => {
  if (
    !existsSync(clientIndexPath) ||
    !["GET", "HEAD"].includes(req.method) ||
    isApiPath(req.path)
  ) {
    next();
    return;
  }

  res.sendFile(
    clientIndexPath,
    {
      headers: {
        "Cache-Control": env.isProduction ? "no-cache" : "no-store",
      },
    },
    (error) => {
      if (error) {
        next(error);
      }
    },
  );
});

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
