import z from "zod";

const createOrderValidation = z.object({
  order: z.object({
    contactNumber: z
      .string({ message: "Contact number is required" })
      .regex(/^[0-9]{11}$/, "Contact number must be exactly 11 digits"),
    deliveryAddress: z.string({ message: "Delivery address is required" }),
  }),

  orderItems: z
    .array(
      z.object({
        productVariantId: z.string({ message: "Variant ID is required" }),
        quantity: z.number({ message: "Quantity is required" }).int().min(1),
      }),
    )
    .min(1, "At least one item is required"),
});

export const orderValidation = {
  createOrderValidation,
};
