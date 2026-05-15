import z from "zod";

const createCategoryValidation = z.object({
  categoryName: z
    .string()
    .min(1, "Category name must be at least 1 character long")
    .max(50, "Category name must be at most 50 characters long")
    .transform((name) => name.trim().toUpperCase()),
});

const updateCategoryValidation = z.object({
  categoryName: z
    .string()
    .min(1, "Category name must be at least 1 character long")
    .max(50, "Category name must be at most 50 characters long")
    .transform((name) => name.trim().toUpperCase()),
});

export const categoryValidation = {
  createCategoryValidation,
  updateCategoryValidation,
};
