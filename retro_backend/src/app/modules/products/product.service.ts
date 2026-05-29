import status from "http-status";
import { IRequestUserInterface } from "../../interfaces/requestUserInterface";
import { prisma } from "../../lib/prisma";
import AppError from "../../middleware/appError";
import { ICreateProduct, IUpdateProduct } from "./product.interface";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { IQueryParams } from "../../interfaces/query.interface";
import { Prisma, Product } from "../../../generated/prisma/client";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  productFilterableFields,
  productIncludingConfig,
  productSearchedFields,
} from "./product.contstant";

const createProductService = async (
  user: IRequestUserInterface,
  payload: ICreateProduct,
) => {
  // find user data
  const sellerData = await prisma.seller.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!sellerData) {
    throw new AppError(status.NOT_FOUND, "Seller not found");
  }

  // find category
  const category = await prisma.productCategory.findFirst({
    where: {
      categoryName: payload.categoryName,
    },
  });

  if (!category) {
    throw new AppError(status.BAD_REQUEST, "Category not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        name: payload.product.name,
        teamName: payload.product.teamName,
        year: payload.product.year,
        brand: payload.product.brand,
        description: payload.product.description ?? "",
        images: payload.product.images,
        tags: payload.product.tags,
        sellerId: sellerData.id,
        categoryId: category.id,
      },
    });

    await tx.productVariant.createMany({
      data: payload.variants.map((variant) => {
        return {
          price: variant.price as number,
          stock: variant.stock as number,
          size: variant.size,
          productId: newProduct.id,
        };
      }),
    });

    const returnEntireProductData = await tx.product.findUnique({
      where: {
        id: newProduct.id,
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return returnEntireProductData;
  });

  return result;
};

const updateProductService = async (
  id: string,
  user: IRequestUserInterface,
  payload: IUpdateProduct,
) => {
  const sellerData = await prisma.seller.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!sellerData) {
    throw new AppError(status.NOT_FOUND, "Seller not found");
  }

  const isExist = await prisma.product.findFirst({
    where: {
      id,
      sellerId: sellerData.id,
    },
  });

  if (!isExist) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  // delete old image
  if (payload.product?.images && payload.product.images.length > 0) {
    const oldImage = isExist.images;

    oldImage.forEach((imageUrl) => deleteFileFromCloudinary(imageUrl));
  }

  const result = await prisma.$transaction(async (tx) => {
    // update product
    await tx.product.update({
      where: {
        id,
      },
      data: {
        ...payload.product,
      },
    });

    // update variants
    if (payload.variants && payload.variants.length > 0) {
      // delet all previous data
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      // add new data
      await tx.productVariant.createMany({
        data: payload.variants.map((variant) => {
          return {
            price: variant.price as number,
            stock: variant.stock as number,
            size: variant.size,
            productId: id,
          };
        }),
      });
    }

    const returnEntireProductData = await tx.product.findUnique({
      where: {
        id,
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return returnEntireProductData;
  });

  return result;
};

const getAllProductsService = async (query: IQueryParams) => {
  // Map flat keys to nested paths
  if (query.price) {
    query["variants.some.price"] = query.price;
    delete query.price;
  }
  if (query.size) {
    query["variants.some.size"] = query.size;
    delete query.size;
  }
  if (query.categoryName) {
    query["category.categoryName"] = query.categoryName;
    delete query.categoryName;
  }

  if (query.tags && typeof query.tags === "string") {
    const tagsArray = query.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase());
    query.tags = {
      hasSome: tagsArray,
    };
  }

  const queryBuilders = new QueryBuilder<
    Product,
    Prisma.ProductWhereInput,
    Prisma.ProductInclude
  >(prisma.product, query, {
    searchableFields: productSearchedFields,
    filterableFields: productFilterableFields,
  });

  const result = await queryBuilders
    .search()
    .filter()
    .where({ isDeleted: false })
    .sort()
    .include({
      variants: {
        select: {
          id: true,
          price: true,
          stock: true,
          size: true,
        },
      },
      category: {
        select: {
          id: true,
          categoryName: true,
        },
      },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    })
    .dynamicInclude(productIncludingConfig)
    .fields()
    .pagination()
    .execute();

  return result;
};

const deleteProductService = async (
  id: string,
  user: IRequestUserInterface,
) => {
  const sellerData = await prisma.seller.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!sellerData) {
    throw new AppError(status.NOT_FOUND, "Seller not found");
  }

  const isExist = await prisma.product.findFirst({
    where: {
      id,
      sellerId: sellerData.id,
    },
  });

  if (!isExist) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  // soft delete
  await prisma.product.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

const updateIsFeaturedService = async (
  productId: string,
  payload: { isFeatured: boolean },
) => {
  // find product
  const isExist = await prisma.product.findUnique({
    where: {
      id: productId,
      isDeleted: false,
    },
  });

  if (!isExist) {
    throw new AppError(status.NOT_FOUND, "Product not found");
  }

  if (isExist.isFeatured === payload.isFeatured) {
    throw new AppError(
      status.BAD_REQUEST,
      `Product is already ${payload.isFeatured}`,
    );
  }

  // update product
  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      isFeatured: payload.isFeatured,
    },
  });
};

const getMyProductsService = async (
  user: IRequestUserInterface,
  query: IQueryParams,
) => {
  // find seller
  const sellerData = await prisma.seller.findUnique({
    where: {
      email: user.email,
    },
  });

  if (!sellerData) {
    throw new AppError(status.NOT_FOUND, "Seller not found");
  }

  if (query.price) {
    query["variants.some.price"] = query.price;
    delete query.price;
  }
  if (query.size) {
    query["variants.some.size"] = query.size;
    delete query.size;
  }
  if (query.categoryName) {
    query["category.categoryName"] = query.categoryName;
    delete query.categoryName;
  }

  if (query.tags && typeof query.tags === "string") {
    const tagsArray = query.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase());
    query.tags = {
      hasSome: tagsArray,
    };
  }

  const queryBuilders = new QueryBuilder<
    Product,
    Prisma.ProductWhereInput,
    Prisma.ProductInclude
  >(prisma.product, query, {
    searchableFields: productSearchedFields,
    filterableFields: productFilterableFields,
  });

  const result = await queryBuilders
    .search()
    .filter()
    .where({ isDeleted: false, sellerId: sellerData.id })
    .sort()
    .include({
      variants: {
        select: {
          id: true,
          price: true,
          stock: true,
          size: true,
        },
      },
      category: {
        select: {
          id: true,
          categoryName: true,
        },
      },
    })
    .dynamicInclude(productIncludingConfig)
    .fields()
    .pagination()
    .execute();

  return result;
};

export const productService = {
  createProductService,
  updateProductService,
  getAllProductsService,
  deleteProductService,
  updateIsFeaturedService,
  getMyProductsService,
};
