// api/endpoints/payments.api.ts
import { apiClient } from '../client';
import { ApiResponse } from '../types/api.types';

export interface ConnectedAccount {
  id: number;
  stripeAccountId: string;
  isOnboarded: boolean;
  accountStatus: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  onboardedAt?: string;
}

export interface Escrow {
  id: number;
  jobId: number;
  totalAmount: number;
  releasedAmount: number;
  heldAmount: number;
  status: 'active' | 'released' | 'disputed' | 'refunded';
  disputeDeadline?: string;
  disputeReason?: string;
  releases?: EscrowRelease[];
}

export interface EscrowRelease {
  id: number;
  milestoneId: number;
  amount: number;
  releasedAt: string;
  status: string;
}

export interface Withdrawal {
  id: number;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
}

export interface PaymentIntentResult {
  paymentIntentId: string;
  clientSecret?: string;
}

export interface Balance {
  availableBalance: number;
  currency: string;
}

export interface DisputeRequest {
  reason: string;
}

export interface WithdrawalRequest {
  amount: number;
}

class PaymentsApi {
  // Stripe Connect
  async createConnectedAccount(): Promise<ApiResponse<ConnectedAccount>> {
    return apiClient.post<ConnectedAccount>('/payments/connect/create-account');
  }

  async getOnboardingLink(): Promise<ApiResponse<string>> {
    return apiClient.get<string>('/payments/connect/onboarding-link');
  }

  async checkOnboardingStatus(): Promise<ApiResponse<boolean>> {
    return apiClient.get<boolean>('/payments/connect/status');
  }

  // Escrow & Payments
  async fundJob(jobId: number): Promise<ApiResponse<PaymentIntentResult>> {
    return apiClient.post<PaymentIntentResult>(`/payments/job/${jobId}/fund`);
  }

  async releaseMilestonePayment(milestoneId: number): Promise<ApiResponse<Escrow>> {
    return apiClient.post<Escrow>(`/payments/milestone/${milestoneId}/release`);
  }

  async releaseFullEscrow(jobId: number): Promise<ApiResponse<Escrow>> {
    return apiClient.post<Escrow>(`/payments/job/${jobId}/release-full`);
  }

  async disputeEscrow(jobId: number, reason: string): Promise<ApiResponse<Escrow>> {
    return apiClient.post<Escrow>(`/payments/job/${jobId}/dispute`, { reason });
  }

  // Balance & Withdrawals
  async getBalance(): Promise<ApiResponse<Balance>> {
    return apiClient.get<Balance>('/payments/balance');
  }

  async requestWithdrawal(amount: number): Promise<ApiResponse<Withdrawal>> {
    return apiClient.post<Withdrawal>('/payments/withdraw', { amount });
  }
}

export const paymentsApi = new PaymentsApi();
