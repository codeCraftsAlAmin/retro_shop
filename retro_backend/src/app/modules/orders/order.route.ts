import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { orderController } from "./order.controller";

const router: Router = Router();

// create order route
router.post(
  "/create-order",
  checkAuth(Role.CUSTOMER),
  orderController.createOrderController,
);

export const orderRouter: Router = router;
