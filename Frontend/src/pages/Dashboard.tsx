import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Briefcase, DollarSign, Clock, TrendingUp, MessageSquare, Bookmark, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useSavedJobs, useShortlistedFreelancers } from "@/hooks/useSavedItems";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import { useQuery } from "@/hooks/useQuery";
import { proposalsApi, Proposal } from "@/api/endpoints/proposals.api";
import { jobsApi } from "@/api/endpoints/jobs.api";

export default function Dashboard() {
  const { user } = useAuth();
  const { ids: savedJobIds } = useSavedJobs();
  const { ids: shortlistIds } = useShortlistedFreelancers();

  const { data: myProposals } = useQuery<Proposal[]>(
    ['my-proposals'],
    () => proposalsApi.getMyProposals(),
    { enabled: !!user }
  );

  const { data: jobsCount } = useQuery<number>(
    ['jobs-count'],
    () => jobsApi.getJobsCount()
  );

  const displayName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.username || 'User';
  const weeklyEarnings = [
    { week: 'W1', amount: 0 },
    { week: 'W2', amount: 0 },
    { week: 'W3', amount: 0 },
    { week: 'W4', amount: 0 },
  ];

  const stats = [
    { icon: Briefcase, label: "Jobs on platform", value: jobsCount ?? 0, color: "text-primary" },
    { icon: Clock, label: "My proposals", value: (myProposals ?? []).length, color: "text-warning" },
    { icon: DollarSign, label: "Saved jobs", value: savedJobIds.length, color: "text-success" },
    { icon: TrendingUp, label: "Shortlist", value: shortlistIds.length, color: "text-primary" },
  ];

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Avatar className="h-14 w-14"><AvatarImage src={user?.avatar} /><AvatarFallback>{displayName[0]}</AvatarFallback></Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {displayName.split(" ")[0]}</h1>
            <p className="text-muted-foreground capitalize">{user?.role ?? "user"} dashboard</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className={cn("h-10 w-10 rounded-lg bg-accent flex items-center justify-center mb-3", s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Earnings overview</h3>
                <Badge variant="secondary">Last 8 weeks</Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyEarnings}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="url(#g)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="proposals">
            <TabsList>
              <TabsTrigger value="proposals">My proposals ({(myProposals ?? []).length})</TabsTrigger>
              <TabsTrigger value="saved-jobs"><Bookmark className="h-3 w-3" />Saved jobs ({savedJobIds.length})</TabsTrigger>
              <TabsTrigger value="shortlist"><Heart className="h-3 w-3" />Shortlist ({shortlistIds.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="proposals" className="space-y-3 mt-4">
              {(myProposals ?? []).map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link to={`/jobs/${p.jobId}`} className="font-medium hover:text-primary line-clamp-1">{p.jobTitle}</Link>
                      <div className="text-xs text-muted-foreground">Submitted {new Date(p.submittedAt).toLocaleDateString()} · Bid ${p.bidAmount.toLocaleString()}</div>
                    </div>
                    <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}
                      className={cn("capitalize", p.status === "approved" && "bg-success text-success-foreground")}>
                      {p.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="saved-jobs" className="mt-4">
              <Card><CardContent className="p-10 text-center text-muted-foreground">
                Saved jobs are stored locally on this device. <Link className="text-primary hover:underline" to="/jobs">Browse jobs</Link>
              </CardContent></Card>
            </TabsContent>
            <TabsContent value="shortlist" className="mt-4">
              <Card><CardContent className="p-10 text-center text-muted-foreground">
                Shortlist is stored locally on this device. <Link className="text-primary hover:underline" to="/freelancers">Find talent</Link>
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>

        <aside>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4" />Recent messages</h3>
                <Button variant="ghost" size="sm" asChild><Link to="/messages">View all</Link></Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Messaging endpoints aren’t implemented on the backend yet.
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
