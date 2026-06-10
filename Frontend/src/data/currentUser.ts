import type { CurrentUser, Message, Proposal } from "@/types";

export const currentUser: CurrentUser = {
  id: "user-me",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  avatar: "https://i.pravatar.cc/200?img=5",
  role: "freelancer",
  unreadMessages: 3,
  notifications: 7,
  stats: {
    activeProjects: 4,
    pendingProposals: 9,
    totalEarnings: 48650,
    responseRate: 96,
    weeklyEarnings: [
      { week: "W1", amount: 1200 },
      { week: "W2", amount: 1850 },
      { week: "W3", amount: 1620 },
      { week: "W4", amount: 2480 },
      { week: "W5", amount: 2120 },
      { week: "W6", amount: 2890 },
      { week: "W7", amount: 3120 },
      { week: "W8", amount: 3480 },
    ],
  },
};

export const myProposals: Proposal[] = [
  { id: "pr-1", jobId: "job-1", jobTitle: "Senior React Developer for SaaS dashboard rebuild", status: "interviewing", submittedAt: "2026-04-28", bidAmount: 75, coverLetter: "I've shipped multiple production SaaS dashboards…" },
  { id: "pr-2", jobId: "job-7", jobTitle: "Full-stack engineer (Next.js + Supabase) for MVP build", status: "pending", submittedAt: "2026-04-30", bidAmount: 11000, coverLetter: "Marketplace MVP experience…" },
  { id: "pr-3", jobId: "job-19", jobTitle: "DevOps engineer to set up CI/CD on AWS", status: "accepted", submittedAt: "2026-04-22", bidAmount: 6500, coverLetter: "Terraform + GitHub Actions specialist…" },
  { id: "pr-4", jobId: "job-13", jobTitle: "iOS developer (Swift) for health & fitness app", status: "rejected", submittedAt: "2026-04-15", bidAmount: 90, coverLetter: "5+ years of SwiftUI…" },
  { id: "pr-5", jobId: "job-21", jobTitle: "Data analyst — build executive KPI dashboards (Looker)", status: "pending", submittedAt: "2026-04-29", bidAmount: 70, coverLetter: "Looker + LookML expert…" },
];

export const recentMessages: Message[] = [
  { id: "m1", fromName: "Acme Studios", fromAvatar: "https://i.pravatar.cc/100?img=12", preview: "Hey Alex — can we hop on a call Thursday?", time: "2h ago", unread: true },
  { id: "m2", fromName: "Lina Park", fromAvatar: "https://i.pravatar.cc/100?img=47", preview: "Approved the latest mockups, looks great.", time: "5h ago", unread: true },
  { id: "m3", fromName: "Northstar Inc.", fromAvatar: "https://i.pravatar.cc/100?img=15", preview: "Sent the contract over for signature.", time: "1d ago", unread: true },
  { id: "m4", fromName: "BrightWave Labs", fromAvatar: "https://i.pravatar.cc/100?img=33", preview: "Milestone 2 funded — you're good to start.", time: "2d ago", unread: false },
];
