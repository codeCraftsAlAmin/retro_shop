import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { orderController } from "./order.controller";
import { validateRequeset } from "../../middleware/zodValidation";
import { orderValidation } from "./order.validation";

const router: Router = Router();

// create order route
router.post(
  "/create-order",
  checkAuth(Role.CUSTOMER),
  validateRequeset(orderValidation.createOrderValidation),
  orderController.createOrderController,
);

export const orderRouter: Router = router;
