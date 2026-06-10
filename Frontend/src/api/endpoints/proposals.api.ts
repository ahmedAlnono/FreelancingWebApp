// api/endpoints/proposals.api.ts
import { apiClient } from '../client';
import { ApiResponse } from '../types/api.types';

export interface Proposal {
  id: number;
  jobId: number;
  jobTitle: string;
  bidAmount: number;
  coverLetter: string;
  status: 'pending' | 'approved' | 'rejected' | 'interview' | string;
  submittedAt: string;
  estimatedDays: number;
}

export interface CreateProposalRequest {
  jobId: number;
  bidAmount: number;
  coverLetter: string;
  estimatedDays: number;
}

export interface UpdateProposalStatusRequest {
  status: 'approved' | 'rejected' | 'interview';
}

class ProposalsApi {
  async getMyProposals(): Promise<ApiResponse<Proposal[]>> {
    return apiClient.get<Proposal[]>('/proposals/my-proposals');
  }

  async createProposal(request: CreateProposalRequest): Promise<ApiResponse<Proposal>> {
    return apiClient.post<Proposal>('/proposals', request);
  }

  async updateProposalStatus(id: number, request: UpdateProposalStatusRequest): Promise<ApiResponse<boolean>> {
    return apiClient.put<boolean>(`/proposals/${id}/status`, request);
  }
}

export const proposalsApi = new ProposalsApi();
