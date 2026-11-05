import { DrawingDocument } from '@/types/whiteboard';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://whiteboard-studio-c21b.onrender.com/api';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const api = {
  async getDrawings(params?: {
    category?: string;
    search?: string;
    isSample?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<DrawingDocument[]>> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.isSample !== undefined) query.append('isSample', String(params.isSample));
    if (params?.sort) query.append('sort', params.sort);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/drawings?${query.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Failed to fetch drawings: ${res.statusText}`);
    return res.json();
  },

  async getDrawing(id: string): Promise<ApiResponse<DrawingDocument>> {
    const res = await fetch(`${API_BASE}/drawings/${id}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Drawing not found: ${res.statusText}`);
    return res.json();
  },

  async createDrawing(data: {
    title: string;
    description?: string;
    category?: string;
    imageUrl: string;
    elements?: any;
    appState?: any;
    isSample?: boolean;
  }): Promise<ApiResponse<DrawingDocument>> {
    const res = await fetch(`${API_BASE}/drawings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to create drawing: ${res.statusText}`);
    return res.json();
  },

  async updateDrawing(
    id: string,
    data: Partial<{
      title: string;
      description?: string;
      category?: string;
      imageUrl?: string;
      elements?: any;
      appState?: any;
    }>,
  ): Promise<ApiResponse<DrawingDocument>> {
    const res = await fetch(`${API_BASE}/drawings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Failed to update drawing: ${res.statusText}`);
    return res.json();
  },

  async deleteDrawing(id: string): Promise<ApiResponse<{ id: string }>> {
    const res = await fetch(`${API_BASE}/drawings/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete drawing: ${res.statusText}`);
    return res.json();
  },

  async getLatestDrawings(): Promise<ApiResponse<DrawingDocument[]>> {
    const res = await fetch(`${API_BASE}/drawings/latest`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch latest drawings: ${res.statusText}`);
    return res.json();
  },

  async getSampleDrawings(): Promise<ApiResponse<DrawingDocument[]>> {
    const res = await fetch(`${API_BASE}/drawings/sample`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch sample drawings: ${res.statusText}`);
    return res.json();
  },
};
