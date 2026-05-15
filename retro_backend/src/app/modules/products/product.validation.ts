import z from "zod";
import { Size } from "../../../generated/prisma/enums";

const createProductValidation = z.object({
  product: z.object({
    name: z.string({ message: "Name is required" }),
    teamName: z.string({ message: "Team name is required" }),
    year: z.string({ message: "Year is required" }),
    brand: z.string({ message: "Brand is required" }),
    description: z.string().optional(),
    images: z.array(z.string({ message: "Images are required" })).optional(),
  }),

  categoryName: z
    .string({ message: "Category name is required" })
    .transform((name) => name.trim().toUpperCase()),

  // variants
  variants: z
    .array(
      z.object({
        size: z.enum([Size.S, Size.M, Size.L, Size.XL, Size.XXL]),
        price: z.number({ message: "Price is required" }).min(0),
        stock: z.number({ message: "Stock is required" }).int().min(0),
      }),
    )
    .min(1, "At least one variant is required"),
});

const updateProductValidation = z.object({
  product: z.object({
    name: z.string({ message: "Name must be a string" }).optional(),
    teamName: z.string({ message: "Team name must be a string" }).optional(),
    year: z.string({ message: "Year must be a string" }).optional(),
    brand: z.string({ message: "Brand must be a string" }).optional(),
    description: z
      .string({ message: "Description must be a string" })
      .optional(),
    images: z
      .array(z.string({ message: "Images must be a string array" }))
      .optional(),
  }),

  // variants
  variants: z
    .array(
      z.object({
        size: z.enum([Size.S, Size.M, Size.L, Size.XL, Size.XXL]),
        price: z.number({ message: "Price must be a number" }).min(0),
        stock: z.number({ message: "Stock must be a number" }).int().min(0),
      }),
    )
    .optional(),
});

export const productValidation = {
  createProductValidation,
  updateProductValidation,
};
