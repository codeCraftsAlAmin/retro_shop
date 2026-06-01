import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { categoryService } from "./category.service";

const createCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const { categoryName } = req.body;

    const result = await categoryService.createCategoryService(
      categoryName as string,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.CREATED,
      message: "Category created successfully",
      data: result,
    });
  },
);

const getAllCategoriesController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await categoryService.getAllCategoriesService();

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Categories fetched successfully",
      data: result,
    });
  },
);

const deleteCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await categoryService.deleteCategoryService(id as string);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Category deleted successfully",
      data: result,
    });
  },
);

const updateCategoryController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { categoryName } = req.body;
    const result = await categoryService.updateCategoryService(
      id as string,
      categoryName as string,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Category updated successfully",
      data: result,
    });
  },
);

export const categoryController = {
  createCategoryController,
  getAllCategoriesController,
  deleteCategoryController,
  updateCategoryController,
};
