import apiClient from "@/app/api/client";

export interface Outlet {
  id_outlet: string;
  name: string;
  address: string;
  phone_number: string | null;
  email: string | null;
  operational_day: string[] | null;
  operational_hour: { start: string; end: string } | null;
}

export async function getOutlets(): Promise<Outlet[]> {
  const res = await apiClient.get<Outlet[]>("/api/outlets");
  return res.data;
}
