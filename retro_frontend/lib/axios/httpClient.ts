import { ApiSuccessResponse } from "@/types/api.types";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not defined in environment variables");
}

const axiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: { "Content-Type": "application/json" },
  });

  return instance;
};

export interface ApiRequestOptions {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

// get request
const httpGet = async <TData>(
  endpoint: string,
  options?: ApiRequestOptions,
): Promise<ApiSuccessResponse<TData>> => {
  try {
    const response = await axiosInstance().get<ApiSuccessResponse<TData>>(
      endpoint,
      {
        params: options?.params,
        headers: options?.headers,
      },
    );

    return response.data;
  } catch (error) {
    console.error(`GET request to ${endpoint} failed:`, error);
    throw error;
  }
};

// post request
const httpPost = async <TData>(
  endpoint: string,
  data: unknown,
  options?: ApiRequestOptions,
): Promise<ApiSuccessResponse<TData>> => {
  try {
    const response = await axiosInstance().post<ApiSuccessResponse<TData>>(
      endpoint,
      data,
      {
        params: options?.params,
        headers: options?.headers,
      },
    );

    return response.data;
  } catch (error) {
    console.error(`POST request to ${endpoint} failed:`, error);
    throw error;
  }
};

// put request
const httpPut = async <TData>(
  endpoint: string,
  data: unknown,
  options?: ApiRequestOptions,
): Promise<ApiSuccessResponse<TData>> => {
  try {
    const response = await axiosInstance().put<ApiSuccessResponse<TData>>(
      endpoint,
      data,
      {
        params: options?.params,
        headers: options?.headers,
      },
    );

    return response.data;
  } catch (error) {
    console.error(`PUT request to ${endpoint} failed:`, error);
    throw error;
  }
};

// delete request
const httpDelete = async <TData>(
  endpoint: string,
  options?: ApiRequestOptions,
): Promise<ApiSuccessResponse<TData>> => {
  try {
    const response = await axiosInstance().delete<ApiSuccessResponse<TData>>(
      endpoint,
      {
        params: options?.params,
        headers: options?.headers,
      },
    );

    return response.data;
  } catch (error) {
    console.error(`DELETE request to ${endpoint} failed:`, error);
    throw error;
  }
};

export const httpClient = {
  httpGet,
  httpPost,
  httpPut,
  httpDelete,
};
