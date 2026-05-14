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

// create product route
router.post(
  "/create-product",
  multerUpload.array("images", 4),
  checkAuth(Role.SELLER),
  validateRequeset(sellerValidation.createProductValidation),
  sellerController.createProductController,
);

export const sellerRouter: Router = router;
