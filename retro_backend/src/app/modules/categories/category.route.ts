import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequeset } from "../../middleware/zodValidation";
import { categoryValidation } from "./category.validation";
import { categoryController } from "./category.controller";

const router: Router = Router();

// create category route
router.post(
  "/create-category",
  checkAuth(Role.ADMIN),
  validateRequeset(categoryValidation.createCategoryValidation),
  categoryController.createCategoryController,
);

// get all categories
router.get(
  "/get-categories",
  checkAuth(Role.ADMIN),
  categoryController.getAllCategoriesController,
);

// delete category
router.delete(
  "/delete-category/:id",
  checkAuth(Role.ADMIN),
  categoryController.deleteCategoryController,
);

// update category
router.put(
  "/update-category/:id",
  checkAuth(Role.ADMIN),
  validateRequeset(categoryValidation.updateCategoryValidation),
  categoryController.updateCategoryController,
);

export const categoryRouter: Router = router;
