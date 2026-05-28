import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { reviewController } from "./review.controller";
import { validateRequeset } from "../../middleware/zodValidation";
import { reviewValidation } from "./review.validation";

const router: Router = Router();

// create review
router.post(
  "/:id",
  checkAuth(Role.CUSTOMER, Role.SELLER, Role.ADMIN),
  validateRequeset(reviewValidation.createReviewValidation),
  reviewController.createReviewController,
);

// update review
router.put(
  "/:id",
  checkAuth(Role.CUSTOMER, Role.SELLER, Role.ADMIN),
  reviewController.updateReviewController,
);

// get all reviews
router.get("/", reviewController.getAllReviewsController);

// delete review
router.delete(
  "/:id",
  checkAuth(Role.CUSTOMER, Role.SELLER, Role.ADMIN),
  reviewController.deleteReviewController,
);

// reply comment
router.post(
  "/:id/reply",
  checkAuth(Role.CUSTOMER, Role.SELLER, Role.ADMIN),
  reviewController.replyReviewController,
);

export const reviewRouter: Router = router;
