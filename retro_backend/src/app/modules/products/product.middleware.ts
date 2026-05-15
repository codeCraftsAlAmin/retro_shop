import { NextFunction, Request, Response } from "express";

export const uploadProductMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //convert form(text data) into json object
  const body = req.body.data ? JSON.parse(req.body.data) : req.body;

  //convert string type to array data
  const variants =
    typeof body.variants === "string"
      ? JSON.parse(body.variants)
      : body.variants;

  // handle image-file
  const files = req.files as Express.Multer.File[];
  const imagePaths = files?.map((file) => file.path) || [];

  // make product payload
  const payload = {
    categoryName: body.categoryName,
    variants: variants,
    product: {
      name: body.name,
      teamName: body.teamName,
      year: body.year,
      brand: body.brand,
      description: body.description,
      images: imagePaths, // directly set array images
    },
  };

  // set payload
  req.body = payload;
  next();
};

export const updateUpProductMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //convert form(text data) into json object
  const body = req.body.data ? JSON.parse(req.body.data) : req.body;

  //convert string type to array data
  const variants =
    typeof body.variants === "string"
      ? JSON.parse(body.variants)
      : body.variants;

  // handle image-file
  const files = req.files as Express.Multer.File[];
  const imagePaths = files?.map((file) => file.path) || [];

  // make product payload
  const payload: any = {
    variants: variants,
    product: body.product || {},
  };

  // if these fields exist in body, then set them in product
  const productFields = [
    "name",
    "teamName",
    "year",
    "brand",
    "description",
    "images",
  ];

  productFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload.product[field] = body[field];
    }
  });

  if (imagePaths.length > 0) {
    payload.product.images = imagePaths;
  }

  // set payload
  req.body = payload;
  next();
};
