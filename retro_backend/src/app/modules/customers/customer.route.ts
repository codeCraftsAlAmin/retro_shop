import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { customerController } from "./customer.controller";
import { multerUpload } from "../../config/multer.config";
import { validateRequeset } from "../../middleware/zodValidation";
import { customerValidation } from "./customer.validation";

const router: Router = Router();

// update my profile route
router.put(
  "/update-profile",
  multerUpload.single("profilePhoto"),
  checkAuth(Role.CUSTOMER),
  validateRequeset(customerValidation.updateMyProfileValidation),
  customerController.updateMyProfileController,
);

export const customerRouter: Router = router;
