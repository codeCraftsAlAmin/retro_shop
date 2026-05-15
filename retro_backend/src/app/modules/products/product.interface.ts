import { Size } from "../../../generated/prisma/enums";

// create product
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

export interface ICreateProduct {
  product: IProduct;
  categoryName: string;
  variants: IProductVariant[];
}

// update product
export interface IUProduct {
  name?: string;
  teamName?: string;
  year?: string;
  brand?: string;
  description?: string;
  images?: string[];
}

export interface IUpdateProductVariant {
  size: Size;
  price: number;
  stock: number;
}

export interface IUpdateProduct {
  product?: IUProduct;
  variants?: IUpdateProductVariant[];
}
