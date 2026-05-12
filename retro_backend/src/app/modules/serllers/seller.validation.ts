import { z } from "zod";
import { Gender } from "../../../generated/prisma/enums";

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

export const sellerValidation = {
  updateMyProfileValidation,
};
