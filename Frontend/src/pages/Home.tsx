import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles, Shield, Zap, Users, Briefcase, Star } from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "@/components/jobs/JobCard";
import { FreelancerCard } from "@/components/freelancers/FreelancerCard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@/hooks/useQuery";
import { categoriesApi, Category } from "@/api/endpoints/categories.api";
import { jobsApi, Job } from "@/api/endpoints/jobs.api";
import { freelancersApi, Freelancer } from "@/api/endpoints/freelancers.api";
import { mapCategory, mapJob, mapFreelancer } from "@/api/adapters/ui.adapters";

const stats = [
  { label: "Active jobs", value: "37k+" },
  { label: "Top freelancers", value: "12k+" },
  { label: "Countries", value: "150+" },
  { label: "Avg. rating", value: "4.9★" },
];

const features = [
  { icon: Sparkles, title: "AI-matched gigs", desc: "Smart suggestions based on your skills and history." },
  { icon: Shield, title: "Secure payments", desc: "Escrow-protected milestones for total peace of mind." },
  { icon: Zap, title: "Hire in hours", desc: "Top freelancers respond fast — start projects same-day." },
  { icon: Users, title: "Trusted community", desc: "Verified profiles, real reviews, no surprises." },
];

export default function Home() {
  const [q, setQ] = useState("");
  const nav = useNavigate();

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>(
    ['categories'],
    () => categoriesApi.getAll()
  );

  const { data: jobsResult, isLoading: jobsLoading } = useQuery<{ items: Job[] }>(
    ['jobs', { page: 1, pageSize: 20 }],
    () => jobsApi.getJobs({ page: 1, pageSize: 20 })
  );

  const { data: freelancersResult, isLoading: freelancersLoading } = useQuery<{ items: Freelancer[] }>(
    ['freelancers', { page: 1, pageSize: 20 }],
    () => freelancersApi.getFreelancers({ page: 1, pageSize: 20 })
  );

  const featuredJobs = (jobsResult?.items ?? []).filter((j) => j.isFeatured).slice(0, 4).map(mapJob);
  const topFreelancers = (freelancersResult?.items ?? []).filter((f) => f.isTopRated).slice(0, 4).map(mapFreelancer);
  const uiCategories = (categories ?? []).map(mapCategory);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="container relative py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge variant="outline" className="mb-6 gap-1 border-primary/30 bg-primary/5">
              <Sparkles className="h-3 w-3 text-primary" /> New: AI-powered job matching
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Where great <span className="text-gradient">work</span> happens
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Hire vetted freelancers or land your next gig — across design, dev, writing, and more.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); nav(`/jobs?q=${encodeURIComponent(q)}`); }}
              className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto p-2 rounded-2xl border border-border/60 bg-card shadow-elegant"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={q} onChange={(e) => setQ(e.target.value)}
                  placeholder="Try: 'React developer', 'logo design'..."
                  className="pl-12 h-12 border-0 bg-transparent focus-visible:ring-0 text-base"
                />
              </div>
              <Button type="submit" size="lg" className="gradient-primary text-primary-foreground border-0">
                Search <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-gradient">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Browse by category</h2>
            <p className="text-muted-foreground">Find work in your field of expertise.</p>
          </div>
          <Button variant="ghost" asChild><Link to="/categories">View all <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(categoriesLoading ? [] : uiCategories).slice(0, 6).map((c, i) => {
            const Icon = (Icons as Record<string, Icons.LucideIcon>)[c.icon] || Briefcase;
            return (

              <motion.div key={c.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/jobs?category=${c.slug}`}>
                  <Card className="hover:border-primary/40 hover:shadow-elegant transition-all group h-full">
                    <CardContent className="p-5 text-center">
                      <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-accent flex items-center justify-center group-hover:gradient-primary transition-all">
                        <Icon className="h-6 w-6 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div className="font-semibold text-sm mb-1">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.jobCount.toLocaleString()} jobs</div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
          {(categoriesLoading || !categories) && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-muted-foreground">Loading categories…</CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Featured jobs */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured jobs</h2>
            <p className="text-muted-foreground">Hand-picked opportunities from top clients.</p>
          </div>
          <Button variant="ghost" asChild><Link to="/jobs">Browse all <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {jobsLoading ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">Loading jobs…</CardContent></Card>
          ) : featuredJobs.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
        </div>
      </section>

      {/* Top freelancers */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Top-rated talent</h2>
            <p className="text-muted-foreground">Vetted experts ready to deliver.</p>
          </div>
          <Button variant="ghost" asChild><Link to="/freelancers">View all <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {freelancersLoading ? (
            <Card className="col-span-full"><CardContent className="p-6 text-center text-muted-foreground">Loading freelancers…</CardContent></Card>
          ) : topFreelancers.map((f, i) => <FreelancerCard key={f.id} freelancer={f} index={i} />)}
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Built for serious work</h2>
          <p className="text-muted-foreground">Everything you need to find, hire, and pay — in one place.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full hover:border-primary/40 transition-all">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center mb-4 shadow-elegant">
                    <f.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <Card className="overflow-hidden border-primary/20">
          <div className="relative gradient-primary p-10 md:p-16 text-center text-primary-foreground">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(0_0%_100%/0.15),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to start?</h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">Join thousands of clients and freelancers building amazing things together.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" variant="secondary" asChild><Link to="/signup">Join as freelancer</Link></Button>
                <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10" asChild>
                  <Link to="/post-job">Hire talent</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
