import apiClient from "../client";
import { ApiResponse } from "../types";
import { ProductPage } from "@/app/types/product";

export const getAllActiveProducts = async (): Promise<ApiResponse<ProductPage>> => {
  try {
    const response = await apiClient.get(`/api/products`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': "*",
        // 'Authorization': "Bearer " + data.atkn,
      },

    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Re-fetch a specific set of products (used for cart price revalidation).
 * Inactive/unknown ids are dropped server-side; backend rejects `?ids=`
 * with more than 50 ids, so callers must chunk before calling.
 */
export const getProductsByIds = async (
  ids: string[],
): Promise<ApiResponse<ProductPage>> => {
  try {
    const response = await apiClient.get(`/api/products`, {
      params: { ids: ids.join(',') },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
