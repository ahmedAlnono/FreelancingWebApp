// api/endpoints/categories.api.ts
import { apiClient } from '../client';
import { ApiResponse } from '../types/api.types';

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  jobCount: number;
  subCategories: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  icon: string;
  description: string;
  parentCategoryId?: number | null;
}

class CategoriesApi {
  async getAll(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>('/categories');
  }

  async getById(id: number): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(`/categories/${id}`);
  }

  async getBySlug(slug: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(`/categories/slug/${slug}`);
  }

  async create(request: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return apiClient.post<Category>('/categories/add', request);
  }
}

export const categoriesApi = new CategoriesApi();

