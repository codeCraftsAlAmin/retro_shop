"use server";

import { httpClient } from "@/lib/axios/httpClient";

interface IVariant {
  id: string;
  price: number;
  stock: number;
  size: string;
}

interface IProduct {
  id: string;
  name: string;
  teamName: string;
  year: string;
  brand: string;
  tags: string[];
  description: string;
  images: string[];
  isFeatured: boolean;
  sellCount: number;
  isDeleted: boolean;

  categoryId: string;
  sellerId: string;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  variants: IVariant[];
}

export async function getProducts() {
  const products = await httpClient.httpGet<IProduct[]>(
    "/products/get-all-products",
  );
  // console.log(products);

  return products;
}
