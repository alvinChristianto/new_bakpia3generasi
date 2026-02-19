import apiClient from "../client";
import { ApiResponse } from "../types";


export const fetchExampleData = async (
  id: string,
): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.get(`/example/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkoutOrder = async (
  payload: any,
): Promise<ApiResponse<any>> => {
  console.log(payload);
  const formData = {
    customer_data: payload.customerData,
    total_price: payload.totalPrice,
    order_items: payload.bakpia,
    shipping_address: payload.address,
    shipping_cost: payload.shippingCost,
    tax_amount: payload.taxAmount,
  };


  try {
    const response = await apiClient.post("/api/midtranstokenv1", formData, {
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


