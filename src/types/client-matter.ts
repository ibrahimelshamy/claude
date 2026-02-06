export interface ClientMatter {
  id: string;
  clientName: string;
  matterName: string;
  matterNumber: string;
  status: 'active' | 'inactive' | 'archived';
  billableRate?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
