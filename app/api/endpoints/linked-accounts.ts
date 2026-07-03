import apiClient from "../client";

export interface LinkedAccounts {
  has_password: boolean;
  providers: string[];
}

export async function getLinkedAccounts(
  accessToken: string,
): Promise<LinkedAccounts> {
  const { data } = await apiClient.get<LinkedAccounts>(
    "/api/profile/linked-accounts",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return data;
}

/** Set the first password for a Google-only account (no current password needed). */
export async function setPassword(
  accessToken: string,
  payload: { new_password: string; new_password_confirmation: string },
): Promise<{ message: string }> {
  const { data } = await apiClient.put("/api/profile/password", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

export async function unlinkProvider(
  accessToken: string,
  provider: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.delete(
    `/api/profile/linked-accounts/${provider}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return data;
}
