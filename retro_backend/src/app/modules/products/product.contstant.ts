import { Prisma } from "../../../generated/prisma/client";

const productSearchedFields = ["name", "brand", "teamName"];

const productFilterableFields = [
  "name",
  "brand",
  "teamName",
  "year",
  "category.categoryName",
  "variants.some.price",
  "variants.some.size",
  "variants.stock",
];

const productIncludingConfig: Partial<
  Record<
    keyof Prisma.ProductInclude,
    Prisma.ProductInclude[keyof Prisma.ProductInclude]
  >
> = {
  variants: {
    select: {
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
  
};
export {
  productFilterableFields,
  productSearchedFields,
  productIncludingConfig,
};
