import status from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";

const createCategoryService = async (name: string) => {
  // check category already exists
  const categoryExists = await prisma.productCategory.findFirst({
    where: {
      name,
    },
  });

  if (categoryExists) {
    throw new AppError(status.FORBIDDEN, "Category already exists");
  }

  const result = await prisma.productCategory.create({
    data: {
      name: name,
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

const updateCategoryService = async (id: string, name: string) => {
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
      name,
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
      name,
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
