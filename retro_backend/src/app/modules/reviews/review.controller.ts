import { Request, Response } from "express";
import { status } from "http-status";
import { reviewService } from "./review.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createReviewController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const payload = req.body;
    const result = await reviewService.createReview(
      id as string,
      user!,
      payload,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.CREATED,
      message: "Review created successfully",
      data: result,
    });
  },
);

const updateReviewController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const { comment } = req.body;
    const result = await reviewService.updateReview(
      id as string,
      user!,
      comment,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Review updated successfully",
      data: result,
    });
  },
);

const getAllReviewsController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await reviewService.getAllReviews();

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Reviews fetched successfully",
      data: result,
    });
  },
);

const deleteReviewController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const result = await reviewService.deleteReview(id as string, user!);

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Review deleted successfully",
      data: result,
    });
  },
);

const replyReviewController = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const { comment } = req.body;
    const result = await reviewService.replyReview(
      id as string,
      user!,
      comment,
    );

    sendResponse(res, {
      ok: true,
      statusCode: status.OK,
      message: "Review replied successfully",
      data: result,
    });
  },
);

export const reviewController = {
  createReviewController,
  updateReviewController,
  getAllReviewsController,
  deleteReviewController,
  replyReviewController,
};
