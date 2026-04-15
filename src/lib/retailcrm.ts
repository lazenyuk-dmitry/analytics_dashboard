import { RetailCRMOrdersListParams } from '@/types/retailcrm/params';
import { RetailCRMOrdersListResponse } from '@/types/retailcrm/response';
import axios from 'axios';

export const retailApi = axios.create({
  baseURL: process.env.RETAILCRM_URL,
  params: {
    apiKey: process.env.RETAILCRM_KEY,
  },
});

export async function getOrders({ limit }: RetailCRMOrdersListParams): Promise<RetailCRMOrdersListResponse> {
  const { data } = await retailApi.get<RetailCRMOrdersListResponse>('/api/v5/orders', {
    params: {
      limit: limit || 100
    }
  });

  return data;
}
