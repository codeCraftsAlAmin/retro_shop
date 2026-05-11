import express, { Application, Request, Response } from "express";
import { routeError } from "./app/middleware/routeError";
import globalErrorHandler from "./app/middleware/globalError";
import { authRouter } from "./app/modules/auth/auth.route";
import { envVars } from "./app/config/env";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    allowedHeaders: ["content-type", "authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(cookieParser());

// auth route
app.use("/api/auth", authRouter);

// social login route
app.use("/api/auth", toNodeHandler(auth));

// base route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello!, this is Retro-Shop");
});

// route error handler
app.use(routeError);

// global error handler
app.use(globalErrorHandler);

export default app;
