import express, { Application, Request, Response } from "express";
import { routeError } from "./app/middleware/routeError";
import globalErrorHandler from "./app/middleware/globalError";

const app: Application = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// app.use(
//   cors({
//     origin: [
//       envVars.FRONTEND_URL,
//       envVars.BETTER_AUTH_URL,
//       "http://localhost:3000",
//       "http://localhost:5000",
//     ],
//     allowedHeaders: ["content-type", "authorization"],
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     credentials: true,
//   }),
// );

// base route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello!, this is Retro-Shop");
});

// route error handler
app.use(routeError);

// global error handler
app.use(globalErrorHandler);

export default app;
