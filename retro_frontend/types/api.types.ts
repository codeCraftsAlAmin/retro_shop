export interface ApiSuccessResponse<TData = unknown> {
  ok: true;
  message: string;
  data: {
    data: TData;
    meta?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  ok: false;
  message: string;
}
