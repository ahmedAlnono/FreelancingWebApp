// api/endpoints/freelancers.api.ts
import { apiClient } from '../client';
import { ApiResponse, PagedResult, QueryParams } from '../types/api.types';

export interface Freelancer {
  id: number;
  name: string;
  avatar: string;
  title: string;
  location: string;
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  completedProjects: number;
  hoursWorked: number;
  responseRate: number;
  isOnline: boolean;
  availability: 'available' | 'busy' | 'unavailable';
  level: 'beginner' | 'intermediate' | 'expert';
  isTopRated: boolean;
  memberSince: string;
  skills: string[];
}

export interface FreelancerDetail extends Freelancer {
  bio: string;
  coverImage: string;
  totalEarnings: number;
  languages: Language[];
  portfolio: Portfolio[];
  reviews: Review[];
  workHistory: WorkHistory[];
}

export interface Language {
  name: string;
  level: 'Native' | 'Fluent' | 'Conversational' | 'Basic';
}

export interface Portfolio {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  tags: string[];
}

export interface Review {
  id: number;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

export interface WorkHistory {
  jobTitle: string;
  clientName: string;
  rating: number;
  feedback: string;
  startDate: string;
  endDate: string;
  amount: number;
}

export interface FreelancerFilterParams extends QueryParams {
  skills?: string[];
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  availability?: string;
  level?: string;
}

class FreelancersApi {
  async getFreelancers(params: FreelancerFilterParams): Promise<ApiResponse<PagedResult<Freelancer>>> {
    const freeLancers = apiClient.get<PagedResult<Freelancer>>('/freelancers', { params });
    console.log((await freeLancers).data.items);
    return freeLancers;
  }

  async getFreelancerById(id: number): Promise<ApiResponse<FreelancerDetail>> {
    return apiClient.get<FreelancerDetail>(`/freelancers/${id}`);
  }
}

export const freelancersApi = new FreelancersApi();
