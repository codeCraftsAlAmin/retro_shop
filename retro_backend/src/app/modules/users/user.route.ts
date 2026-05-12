import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { userController } from "./user.controller";

const router: Router = Router();

// get my profile route
router.get(
  "/my-profile",
  checkAuth(Role.CUSTOMER, Role.SELLER, Role.ADMIN),
  userController.getMyProfileController,
);

// get all users route
router.get("/", checkAuth(Role.ADMIN), userController.getAllUsersController);

export const userRouter: Router = router;
