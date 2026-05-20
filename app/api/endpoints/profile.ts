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
