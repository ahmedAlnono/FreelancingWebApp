// api/endpoints/dashboard.api.ts
import { apiClient } from '../client';
import { ApiResponse } from '../types/api.types';

export interface FreelancerDashboard {
  totalEarnings: number;
  monthlyEarnings: number;
  activeProposals: number;
  completedProjects: number;
  responseRate: number;
  profileViews: number;
  savedJobs: number;
  rating: number;
  reviewsCount: number;
}

export interface ClientDashboard {
  activeJobs: number;
  totalSpent: number;
  proposalsReceived: number;
  hiredFreelancers: number;
  averageRating: number;
  completedProjects: number;
  openJobs: number;
}

export interface EarningsChartData {
  labels: string[];
  datasets: {
    earnings: number[];
    pending: number[];
  };
}

export interface Activity {
  id: string;
  type: 'proposal' | 'message' | 'review' | 'payment' | 'job';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface StatsOverview {
  totalUsers: number;
  totalFreelancers: number;
  totalClients: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalVolume: number;
  platformFees: number;
}

class DashboardApi {
  async getFreelancerStats(): Promise<ApiResponse<FreelancerDashboard>> {
    return apiClient.get<FreelancerDashboard>('/dashboard/freelancer-stats');
  }

  async getClientStats(): Promise<ApiResponse<ClientDashboard>> {
    return apiClient.get<ClientDashboard>('/dashboard/client-stats');
  }

  async getEarningsChart(period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<EarningsChartData>> {
    return apiClient.get<EarningsChartData>('/dashboard/earnings-chart', { params: { period } });
  }

  async getRecentActivity(limit: number = 10): Promise<ApiResponse<Activity[]>> {
    return apiClient.get<Activity[]>('/dashboard/recent-activity', { params: { limit } });
  }

  async getPlatformStats(startDate?: string, endDate?: string): Promise<ApiResponse<StatsOverview>> {
    return apiClient.get<StatsOverview>('/admin/stats/platform', { params: { startDate, endDate } });
  }
}

export const dashboardApi = new DashboardApi();
