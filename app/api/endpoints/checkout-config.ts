import apiClient from "../client";

export interface CheckoutConfig {
  admin_fee_percent: number;
  admin_fee_max: number;
}

/**
 * Admin fee percent/cap for display only — the backend recomputes and
 * enforces the actual fee in OrderController::getTokenMidtransv1.
 */
export const getCheckoutConfig = async (): Promise<CheckoutConfig> => {
  const response = await apiClient.get("/api/checkout/config");
  return response.data;
};
