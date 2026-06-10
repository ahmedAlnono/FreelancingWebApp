export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  jobCount: number;
  description: string;
};

export type Skill = string;

export type ClientInfo = {
  id: string;
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
  verified: boolean;
};

export type BudgetType = "fixed" | "hourly";
export type ProjectLength = "less-than-1-month" | "1-to-3-months" | "3-to-6-months" | "more-than-6-months";
export type ExperienceLevel = "entry" | "intermediate" | "expert";

export type Job = {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  skills: Skill[];
  budgetType: BudgetType;
  budgetMin: number;
  budgetMax: number;
  projectLength: ProjectLength;
  experienceLevel: ExperienceLevel;
  postedAt: string; // ISO
  proposalsCount: number;
  client: ClientInfo;
  ndaRequired: boolean;
  questions: string[];
  featured?: boolean;
};

export type Review = {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number; // 1..5
  comment: string;
  jobTitle: string;
  date: string;
};

export type PortfolioItem = {
  id: string;
  title: string;
  image: string;
  description: string;
  tags: string[];
};

export type WorkHistoryItem = {
  id: string;
  jobTitle: string;
  clientName: string;
  rating: number;
  feedback: string;
  startDate: string;
  endDate: string;
  amount: number;
};

export type Freelancer = {
  id: string;
  name: string;
  title: string;
  avatar: string;
  coverImage: string;
  location: string;
  country: string;
  hourlyRate: number;
  rating: number;
  reviewsCount: number;
  completedProjects: number;
  hoursWorked: number;
  responseRate: number; // percent
  totalEarnings: number;
  online: boolean;
  availability: "available" | "busy" | "unavailable";
  level: ExperienceLevel;
  skills: Skill[];
  bio: string;
  languages: { name: string; level: string }[];
  portfolio: PortfolioItem[];
  reviews: Review[];
  workHistory: WorkHistoryItem[];
  topRated: boolean;
  memberSince: string;
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "client" | "freelancer";
  unreadMessages: number;
  notifications: number;
  stats: {
    activeProjects: number;
    pendingProposals: number;
    totalEarnings: number;
    responseRate: number;
    weeklyEarnings: { week: string; amount: number }[];
  };
};

export type Proposal = {
  id: string;
  jobId: string;
  jobTitle: string;
  status: "pending" | "accepted" | "rejected" | "interviewing";
  submittedAt: string;
  bidAmount: number;
  coverLetter: string;
};

export type Message = {
  id: string;
  fromName: string;
  fromAvatar: string;
  preview: string;
  time: string;
  unread: boolean;
};
