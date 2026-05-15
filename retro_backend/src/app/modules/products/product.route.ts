import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { validateRequeset } from "../../middleware/zodValidation";
import { productValidation } from "./product.validation";
import { productController } from "./product.controller";
import {
  updateUpProductMiddleware,
  uploadProductMiddleware,
} from "./product.middleware";

const router: Router = Router();

// create product route
router.post(
  "/create-product",
  checkAuth(Role.SELLER),
  multerUpload.array("images", 4),
  uploadProductMiddleware,
  validateRequeset(productValidation.createProductValidation),
  productController.createProductController,
);

// update product route
router.put(
  "/update-product/:id",
  checkAuth(Role.SELLER),
  multerUpload.array("images", 4),
  updateUpProductMiddleware,
  validateRequeset(productValidation.updateProductValidation),
  productController.updateProductController,
);

// get all products route
router.get("/get-all-products", productController.getAllProductsController);

// delete product route
router.delete(
  "/delete-product/:id",
  checkAuth(Role.SELLER),
  productController.deleteProductController,
);

export const productRouter: Router = router;
