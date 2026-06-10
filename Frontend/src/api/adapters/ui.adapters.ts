import type { Job as UiJob, Category as UiCategory, Freelancer as UiFreelancer } from '@/types';
import type { Job as ApiJob } from '@/api/endpoints/jobs.api';
import type { Category as ApiCategory } from '@/api/endpoints/categories.api';
import type { Freelancer as ApiFreelancer, FreelancerDetail as ApiFreelancerDetail } from '@/api/endpoints/freelancers.api';

export function mapCategory(api: ApiCategory): UiCategory {
  return {
    id: String(api.id),
    name: api.name,
    slug: api.slug,
    icon: api.icon,
    jobCount: api.jobCount,
    description: api.description,
  };
}

export function mapJob(api: ApiJob): UiJob {
  return {
    id: String(api.id),
    title: api.title,
    description: api.description,
    categoryId: String(api.category?.id ?? ''),
    skills: api.requiredSkills ?? [],
    budgetType: (api.budgetType as UiJob['budgetType']) ?? 'fixed',
    budgetMin: Number(api.budgetMin ?? 0),
    budgetMax: Number(api.budgetMax ?? 0),
    projectLength: api.projectLength as UiJob['projectLength'],
    experienceLevel: api.experienceLevel as UiJob['experienceLevel'],
    postedAt: api.postedAt,
    proposalsCount: api.proposalsCount ?? 0,
    client: {
      id: String(api.client?.id ?? ''),
      name: api.client?.name ?? 'Client',
      avatar: api.client?.avatar ?? '',
      location: api.client?.location ?? '',
      country: api.client?.country ?? '',
      rating: Number(api.client?.rating ?? 0),
      reviewsCount: Number(api.client?.reviewsCount ?? 0),
      totalSpent: Number(api.client?.totalSpent ?? 0),
      memberSince: api.client?.memberSince ?? '',
      jobsPosted: Number(api.client?.jobsPosted ?? 0),
      hireRate: Number(api.client?.hireRate ?? 0),
      verified: Boolean(api.client?.isVerified),
    },
    ndaRequired: Boolean(api.ndaRequired),
    questions: api.questions ?? [],
    featured: Boolean(api.isFeatured),
  };
}

export function mapFreelancer(api: ApiFreelancer): UiFreelancer {
  // List endpoint doesn’t include all details; fill with safe defaults.
  return {
    id: String(api.id),
    name: api.name,
    title: api.title,
    avatar: api.avatar,
    coverImage: '',
    location: api.location,
    country: api.location,
    hourlyRate: api.hourlyRate,
    rating: api.rating,
    reviewsCount: api.reviewsCount,
    completedProjects: api.completedProjects,
    hoursWorked: api.hoursWorked,
    responseRate: api.responseRate,
    totalEarnings: 0,
    online: api.isOnline,
    availability: api.availability,
    level: api.level as UiFreelancer['level'],
    skills: api.skills ?? [],
    bio: '',
    languages: [],
    portfolio: [],
    reviews: [],
    workHistory: [],
    topRated: api.isTopRated,
    memberSince: api.memberSince,
  };
}

export function mapFreelancerDetail(api: ApiFreelancerDetail): UiFreelancer {
  const base = mapFreelancer(api);

  return {
    ...base,
    coverImage: api.coverImage ?? '',
    bio: api.bio ?? '',
    totalEarnings: api.totalEarnings ?? 0,
    languages: (api.languages ?? []).map(l => ({ name: l.name, level: l.level })),
    portfolio: (api.portfolio ?? []).map(p => ({
      id: String(p.id),
      title: p.title,
      image: p.imageUrl,
      description: p.description,
      tags: p.tags ?? [],
    })),
    reviews: (api.reviews ?? []).map(r => ({
      id: String(r.id),
      reviewerName: r.reviewerName,
      reviewerAvatar: r.reviewerAvatar,
      rating: r.rating,
      comment: r.feedback,
      jobTitle: '',
      date: r.createdAt,
    })),
    workHistory: (api.workHistory ?? []).map((h, idx) => ({
      id: String(idx),
      jobTitle: h.jobTitle,
      clientName: h.clientName,
      rating: h.rating,
      feedback: h.feedback,
      startDate: h.startDate,
      endDate: h.endDate,
      amount: h.amount,
    })),
  };
}

