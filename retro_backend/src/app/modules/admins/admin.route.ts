import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { validateRequeset } from "../../middleware/zodValidation";
import { adminValidation } from "./admin.validation";
import { adminController } from "./admin.controller";

const router: Router = Router();

// update my profile route
router.put(
  "/update-profile",
  multerUpload.single("profilePhoto"),
  checkAuth(Role.ADMIN),
  validateRequeset(adminValidation.updateMyProfileValidation),
  adminController.updateMyProfileController,
);

// update user role route
router.put(
  "/update-user-role/:id",
  checkAuth(Role.ADMIN),
  validateRequeset(adminValidation.updateUserRoleValidation),
  adminController.updateUserRoleController,
);

export const adminRouter: Router = router;
