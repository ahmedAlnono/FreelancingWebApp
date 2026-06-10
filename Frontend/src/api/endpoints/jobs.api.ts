// api/endpoints/jobs.api.ts
import { apiClient } from '../client';
import { ApiResponse, PagedResult, QueryParams } from '../types/api.types';

export interface Job {
  id: number;
  title: string;
  description: string;
  category: Category;
  client: ClientInfo;
  budgetType: 'hourly' | 'fixed' | string;
  budgetMin?: number;
  budgetMax?: number;
  budgetFixed?: number;
  projectLength: string;
  experienceLevel: 'entry' | 'intermediate' | 'expert' | string;
  postedAt: string;
  proposalsCount: number;
  isFeatured: boolean;
  ndaRequired: boolean;
  status: string;
  requiredSkills: string[];
  questions: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  jobCount: number;
  subCategories?: Category[];
}

export interface ClientInfo {
  id: number;
  name: string;
  avatar: string;
  location: string;
  country: string;
  rating: number;
  reviewsCount: number;
  totalSpent: number;
  memberSince: string;
  jobsPosted: number;
  hireRate: number;
  isVerified: boolean;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  categoryId: number;
  budgetType: 'hourly' | 'fixed';
  budgetMin?: number;
  budgetMax?: number;
  budgetFixed?: number;
  projectLength: string;
  experienceLevel: string;
  deadline?: string;
  ndaRequired: boolean;
  requiredSkills: string[];
  questions: string[];
}

export type UpdateJobRequest = Partial<CreateJobRequest>

export interface JobFilterParams extends QueryParams {
  categoryId?: number;
  search?: string;
  budgetType?: string;
  minBudget?: number;
  maxBudget?: number;
  experienceLevel?: string;
  skills?: string;
}

class JobsApi {
  async getJobs(params: JobFilterParams): Promise<ApiResponse<PagedResult<Job>>> {
    return apiClient.get<PagedResult<Job>>('/jobs', { params });
  }

  async getJobById(id: number): Promise<ApiResponse<Job>> {
    return apiClient.get<Job>(`/jobs/${id}`);
  }

  async createJob(request: CreateJobRequest): Promise<ApiResponse<Job>> {
    return apiClient.post<Job>('/jobs', request);
  }

  async updateJob(id: number, request: UpdateJobRequest): Promise<ApiResponse<Job>> {
    return apiClient.put<Job>(`/jobs/${id}`, request);
  }

  async deleteJob(id: number): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/jobs/${id}`);
  }

  async getJobsCount(): Promise<ApiResponse<number>> {
    return apiClient.get<number>('/jobs/count');
  }
}

export const jobsApi = new JobsApi();
