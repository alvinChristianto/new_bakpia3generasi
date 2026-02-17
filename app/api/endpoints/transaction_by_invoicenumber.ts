import apiClient from "../client";
import { ApiResponse } from "../types";

export const getTransactionByInvNumber = async (
  invoice_number: string,
): Promise<ApiResponse<any>> => {
 

  try {
    const response = await apiClient.get(`/api/transaction/${invoice_number}`, {
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


