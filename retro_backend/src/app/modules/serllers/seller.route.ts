import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { validateRequeset } from "../../middleware/zodValidation";
import { sellerValidation } from "./seller.validation";
import { sellerController } from "./seller.controller";

const router: Router = Router();

// update my profile route
router.put(
  "/update-profile",
  multerUpload.single("profilePhoto"),
  checkAuth(Role.SELLER),
  validateRequeset(sellerValidation.updateMyProfileValidation),
  sellerController.updateMyProfileController,
);

export const sellerRouter: Router = router;
