import express, { Application, Request, Response } from "express";
import { routeError } from "./app/middleware/routeError";
import globalErrorHandler from "./app/middleware/globalError";
import { authRouter } from "./app/modules/auth/auth.route";
import { envVars } from "./app/config/env";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import { userRouter } from "./app/modules/users/user.route";
import qs from "qs";
import { customerRouter } from "./app/modules/customers/customer.route";
import { sellerRouter } from "./app/modules/serllers/seller.route";
import { adminRouter } from "./app/modules/admins/admin.route";
import { categoryRouter } from "./app/modules/categories/category.route";
import { productRouter } from "./app/modules/products/product.route";
import { orderRouter } from "./app/modules/orders/order.route";

const app: Application = express();

// for query builder
app.set("query parser", (str: string) => qs.parse(str));

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

// user route
app.use("/api/users", userRouter);

// customer route
app.use("/api/customers", customerRouter);

// seller route
app.use("/api/sellers", sellerRouter);

// admin route
app.use("/api/admins", adminRouter);

// category route
app.use("/api/categories", categoryRouter);

// product route
app.use("/api/products", productRouter);

// order route
app.use("/api/orders", orderRouter);

// base route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello!, this is Retro-Shop");
});

// route error handler
app.use(routeError);

// global error handler
app.use(globalErrorHandler);

export default app;
