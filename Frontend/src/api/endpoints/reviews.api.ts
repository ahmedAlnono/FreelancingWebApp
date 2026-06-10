// api/endpoints/reviews.api.ts
import { apiClient } from '../client';
import { ApiResponse } from '../types/api.types';

export interface CreateReviewRequest {
  revieweeId: number;
  jobId: number;
  rating: number;
  feedback: string;
}

// Backend returns whatever the service returns; keep it flexible.
export type CreateReviewResponse = unknown;

class ReviewsApi {
  async createReview(request: CreateReviewRequest): Promise<ApiResponse<CreateReviewResponse>> {
    return apiClient.post<CreateReviewResponse>('/reviews', request);
  }
}

export const reviewsApi = new ReviewsApi();

