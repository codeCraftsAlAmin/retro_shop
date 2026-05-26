export interface IOrder {
  contactNumber: string;
  deliveryAddress: string;
}

export interface IOrderItem {
  productVariantId: string;
  quantity: number;
  price: number;
}

export interface ICreateOrderPayload {
  order: IOrder;
  orderItems: IOrderItem[];
}
