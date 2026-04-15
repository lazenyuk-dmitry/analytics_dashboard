export interface RetailOrder {
  id: number;
  externalId?: string;
  status: string;
  totalSumm: number;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}
