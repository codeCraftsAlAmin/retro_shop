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

// get all orders
router.get(
  "/",
  checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SELLER),
  orderController.getAllOrders,
);

// update ordere status
router.put(
  "/:id",
  checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SELLER),
  orderController.updateOrderController,
);

export const orderRouter: Router = router;
