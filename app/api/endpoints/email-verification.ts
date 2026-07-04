import apiClient from "../client";

/** Confirm an email-verification link (public). */
export async function verifyEmail(payload: {
  email: string;
  token: string;
}): Promise<{ message: string }> {
  const { data } = await apiClient.post("/api/verify-email", payload);
  return data;
}

/** Re-send the verification email for the logged-in, still-unverified customer. */
export async function resendVerification(
  accessToken: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post(
    "/api/email/resend-verification",
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return data;
}
