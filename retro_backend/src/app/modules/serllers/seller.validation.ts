import { z } from "zod";
import { Gender, Size } from "../../../generated/prisma/enums";

const updateMyProfileValidation = z.object({
  name: z
    .string({ message: "Name must be a string" })
    .min(3, "Name must be at least 3 characters long")
    .optional(),
  phone: z
    .string({ message: "Phone must be a string" })
    .regex(/^[0-9]{11}$/, "Phone must be exactly 11 digits")
    .optional(),
  profilePhoto: z.string().url({ message: "Image must be a url" }).optional(),
  address: z.string({ message: "Address must be a string" }).optional(),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
});

const createProductValidation = z.object({
  // products
  name: z.string({ message: "Name is required" }),
  teamName: z.string({ message: "Team name is required" }),
  year: z.string({ message: "Year is required" }),
  brand: z.string({ message: "Brand is required" }),
  description: z.string().optional(),
  images: z
    .array(
      z
        .string({ message: "Images are required" })
        .url({ message: "Image must be a url" }),
    )
    .optional(),

  // categories
  category: z.object({
    name: z
      .string({ message: "Category name is required" })
      .transform((name) => name.trim().toUpperCase()),
  }),

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

export const sellerValidation = {
  updateMyProfileValidation,
  createProductValidation,
};
