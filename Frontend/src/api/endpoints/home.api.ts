// api/endpoints/home.api.ts
import { apiClient } from '../client';
import { ApiResponse } from '../types/api.types';

// Shape depends on `GetHomeStatisticsAsync()`; keep it flexible.
export type HomeStatistics = Record<string, unknown>;

class HomeApi {
  async getMainPageData(): Promise<ApiResponse<HomeStatistics>> {
    return apiClient.get<HomeStatistics>('/home');
  }
}

export const homeApi = new HomeApi();

