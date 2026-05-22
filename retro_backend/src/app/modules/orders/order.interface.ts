import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums";

export interface IOrder {
  totalAmount: number;
  contactNumber: string;
  deliveryAddress: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
}

export interface ICart {
  productVariantId: string;
  quantity: number;
}

export interface IOrderItem {
  productVariantId: string;
  quantity: number;
  price: number;
}

export interface ICreateOrderPayload {
  order: IOrder;
  carts: ICart[];
  orderItems: IOrderItem[];
}
