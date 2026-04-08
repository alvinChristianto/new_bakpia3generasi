import apiClient from "../client";
import { ApiResponse } from "../types";

export const getAllActiveProducts = async (): Promise<ApiResponse<any>> => {
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


