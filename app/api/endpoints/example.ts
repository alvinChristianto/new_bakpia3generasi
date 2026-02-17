import apiClient from '../client';
import { ApiResponse } from '../types';

export const fetchExampleData = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await apiClient.get(`/example/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};