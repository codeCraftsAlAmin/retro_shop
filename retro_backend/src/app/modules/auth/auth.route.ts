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

// verify-email
router.post("/email-otp/verify-email", authController.verifyEmailController);

// sign-in route
router.post(
  "/sign-in/email",
  validateRequeset(authValidation.signInEmailSchema),
  authController.signInController,
);

// sign-out route
router.post("/sign-out", authController.signOutController);

// google login route
router.get("/login/google", authController.googleLoginController);

// success login
router.get("/google/success", authController.googleSuccessController);

// google login error
router.get("/oauth/error", authController.googleErrorController);

export const authRouter: Router = router;
