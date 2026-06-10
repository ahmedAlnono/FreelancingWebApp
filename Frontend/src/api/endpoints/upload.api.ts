// api/endpoints/upload.api.ts
import { apiClient } from '../client';
import { ApiResponse } from '../types/api.types';

class UploadApi {
  async uploadProfileImage(file: File): Promise<ApiResponse<string>> {
    return apiClient.upload<string>('/upload/profile-image', file);
  }


  async uploadResume(file: File): Promise<ApiResponse<string>> {
    return apiClient.upload<string>('/upload/resume', file);
  }
}

export const uploadApi = new UploadApi();

