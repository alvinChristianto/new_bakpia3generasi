import apiClient from "../client";

/** Request a password-reset / set-password email (enumeration-safe: always 200). */
export async function forgotPassword(
  email: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post("/api/forgot-password", { email });
  return data;
}

/** Reset an existing password OR set the first password for a Google-only account. */
export async function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  const { data } = await apiClient.post("/api/reset-password", payload);
  return data;
}
