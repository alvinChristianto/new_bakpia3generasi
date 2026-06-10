import apiClient from "../client";

export interface Profile {
  name: string;
  email: string;
  phone_number: string | null;
  created_at?: string;
}

export async function getProfile(accessToken: string): Promise<Profile> {
  const { data } = await apiClient.get<Profile>("/api/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}

export async function updateProfile(
  accessToken: string,
  payload: { name: string; phone_number: string | null }
): Promise<void> {
  await apiClient.put("/api/profile", payload, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
