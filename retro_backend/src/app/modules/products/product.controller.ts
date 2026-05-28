import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { productService } from "./product.service";
import { IQueryParams } from "../../interfaces/query.interface";

const createProductController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    const result = await productService.createProductService(user!, req.body);

    sendResponse(res, {
      ok: true,
      statusCode: status.CREATED,
      message: "Product created successfully",
      data: result,
    });
  },
);

const updateProductController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = req.user;

    const result = await productService.updateProductService(
      id as string,
      user!,
      req.body,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Product updated successfully",
      data: result,
    });
  },
);

const getAllProductsController = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query;
    const result = await productService.getAllProductsService(
      query as IQueryParams,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Products fetched successfully",
      data: result,
    });
  },
);

const deleteProductController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = req.user;

    await productService.deleteProductService(id as string, user!);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Product deleted successfully",
    });
  },
);

const updateIsFeaturedController = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;

    await productService.updateIsFeaturedService(id as string, req.body);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Product feature updated successfully",
    });
  },
);

const getMyProductsController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const query = req.query;
    const result = await productService.getMyProductsService(
      user!,
      query as IQueryParams,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Products fetched successfully",
      data: result,
    });
  },
);

export const productController = {
  createProductController,
  updateProductController,
  getAllProductsController,
  deleteProductController,
  updateIsFeaturedController,
  getMyProductsController,
};
