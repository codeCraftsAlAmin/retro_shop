import { Category, Size } from "../../../generated/prisma/enums";

export interface ICategory {
  name: Category;
}

export interface IProduct {
  name: string;
  teamName: string;
  year: string;
  brand: string;
  description?: string;
  images: string[];
}

export interface IProductVariant {
  size: Size;
  price: number;
  stock: number;
}

export interface ISellerProduct {
  product: IProduct;
  category: ICategory;
  variants: IProductVariant[];
}
