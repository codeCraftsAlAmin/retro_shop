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

// sign-in route
router.post(
  "/sign-in/email",
  validateRequeset(authValidation.signInEmailSchema),
  authController.signInController,
);

// sign-out route
router.post("/sign-out", authController.signOutController);

export const authRouter: Router = router;
