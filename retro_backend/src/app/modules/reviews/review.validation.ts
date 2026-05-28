import z from "zod";

const createReviewValidation = z.object({
  rating: z.number().min(0).max(5).optional(),
  comment: z.string().optional(),
});

export const reviewValidation = {
  createReviewValidation,
};
