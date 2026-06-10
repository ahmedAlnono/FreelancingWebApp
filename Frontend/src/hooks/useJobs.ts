// hooks/useJobs.ts
import { useQuery } from './useQuery';
import { useMutation } from './useMutation';
import { jobsApi, Job, JobFilterParams, CreateJobRequest } from '../api/endpoints/jobs.api';
import { useAuth } from "@/hooks/useAuth";

export const useJobs = (params: JobFilterParams) => {
  const { user } = useAuth();
  
  const { data: jobsResult, isLoading, refetch } = useQuery(
    ['jobs', params],
    () => jobsApi.getJobs(params)
  );

  const { mutate: createJob, isLoading: isCreating } = useMutation(
    (data: CreateJobRequest) => jobsApi.createJob(data),
    {
      onSuccess: () => {
        refetch();
      }
    }
  );

  const { mutate: updateJob } = useMutation(
    ({ id, data }: { id: number; data: Partial<CreateJobRequest> }) =>
      jobsApi.updateJob(id, data),
    {
      onSuccess: () => {
        refetch();
      }
    }
  );

  const { mutate: deleteJob } = useMutation(
    (id: number) => jobsApi.deleteJob(id),
    {
      onSuccess: () => {
        refetch();
      }
    }
  );

  return {
    jobs: jobsResult?.items || [],
    totalCount: jobsResult?.totalCount || 0,
    isLoading,
    createJob,
    updateJob,
    deleteJob,
    isCreating,
    refetch
  };
};

export const useJob = (id: number) => {
  const { data: jobResult, isLoading, refetch } = useQuery(
    ['job', id],
    () => jobsApi.getJobById(id),
    { enabled: !!id }
  );

  return {
    job: jobResult,
    isLoading,
    refetch
  };
};

export const useFeaturedJobs = (limit: number = 6) => {
  const { data: jobsResult, isLoading } = useQuery(
    ['jobs', { page: 1, pageSize: limit, sortBy: 'recent' }],
    () => jobsApi.getJobs({ page: 1, pageSize: limit, sortBy: 'recent' })
  );

  return {
    featuredJobs: (jobsResult?.items ?? []).filter(j => j.isFeatured).slice(0, limit),
    isLoading
  };
};
