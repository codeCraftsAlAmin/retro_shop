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

// udpate isFeatured
router.put(
  "/update-is-featured/:id",
  checkAuth(Role.ADMIN),
  productController.updateIsFeaturedController,
);

// get my own products
router.get(
  "/get-my-products",
  checkAuth(Role.SELLER),
  productController.getMyProductsController,
);

export const productRouter: Router = router;
