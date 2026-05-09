import { Router } from "express";
import { validateRequeset } from "../../middleware/zodValidation";
import { authValidation } from "./auth.validation";
import { authController } from "./auth.controller";

const router: Router = Router();
// sign-up route
router.post(
  "/sign-up/email",
  validateRequeset(authValidation.signUpEmailSchema),
  authController.signUpController,
);

export const authRouter: Router = router;
