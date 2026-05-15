import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";

const createCategoryService = async (categoryName: string) => {
  // check category already exists
  const categoryExists = await prisma.productCategory.findFirst({
    where: {
      categoryName,
    },
  });

  if (categoryExists) {
    throw new AppError(status.FORBIDDEN, "Category already exists");
  }

  const result = await prisma.productCategory.create({
    data: {
      categoryName,
    },
  });

  return result;
};

const getAllCategoriesService = async () => {
  const result = await prisma.productCategory.findMany();

  return result;
};

const deleteCategoryService = async (id: string) => {
  await prisma.productCategory.delete({
    where: {
      id,
    },
  });
};

const updateCategoryService = async (id: string, categoryName: string) => {
  // check category already exists
  const categoryExists = await prisma.productCategory.findFirst({
    where: {
      id,
    },
  });

  if (!categoryExists) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  const nameAlreadyTaken = await prisma.productCategory.findFirst({
    where: {
      categoryName: categoryName,
      id: { not: id },
    },
  });

  if (nameAlreadyTaken) {
    throw new AppError(
      status.BAD_REQUEST,
      "Another category already has this name",
    );
  }

  const result = await prisma.productCategory.update({
    where: {
      id,
    },
    data: {
      categoryName: categoryName,
    },
  });

  return result;
};

export const categoryService = {
  createCategoryService,
  getAllCategoriesService,
  deleteCategoryService,
  updateCategoryService,
};
