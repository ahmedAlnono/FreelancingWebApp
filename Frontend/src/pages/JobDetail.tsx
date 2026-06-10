import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Calendar, Clock, MapPin, Star, Users, CheckCircle2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSavedJobs } from "@/hooks/useSavedItems";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useJob } from "@/hooks/useJobs";
import { proposalsApi } from "@/api/endpoints/proposals.api";
import { useQuery } from "@/hooks/useQuery";
import { categoriesApi, Category } from "@/api/endpoints/categories.api";
import { mapCategory, mapJob } from "@/api/adapters/ui.adapters";
import { paymentsApi } from "@/api/endpoints/payments.api";

export default function JobDetail() {
  const { id } = useParams();
  const jobId = Number(id);
  const { job: apiJob, isLoading } = useJob(jobId);
  const job = apiJob ? mapJob(apiJob) : null;
  const nav = useNavigate();
  const { has, toggle } = useSavedJobs();
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [bid, setBid] = useState("");
  const [cover, setCover] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: categoriesData } = useQuery<Category[]>(
    ['categories'],
    () => categoriesApi.getAll()
  );
  const categories = (categoriesData ?? []).map(mapCategory);

  if (isLoading) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        Loading job…
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">Job not found</h2>
        <Button asChild><Link to="/jobs">Back to jobs</Link></Button>
      </div>
    );
  }

  const cat = categories.find((c) => c.id === job.categoryId);
  const saved = has(job.id);

  const submit = async () => {
    if (!isAuthenticated) { nav("/login"); return; }
    setSubmitting(true);
    try {
      await proposalsApi.createProposal({
        jobId,
        bidAmount: Number(bid),
        coverLetter: cover,
        estimatedDays: 7,
      });
      setOpen(false);
      toast({ title: "Proposal submitted!", description: "The client has been notified." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-6">
      <Button variant="ghost" onClick={() => nav(-1)} className="mb-4"><ArrowLeft className="h-4 w-4" />Back</Button>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  {cat && <Badge variant="secondary" className="mb-3">{cat.name}</Badge>}
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{job.proposalsCount} proposals</span>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={() => toggle(job.id)} className={cn(saved && "text-primary border-primary")}>
                  <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
                </Button>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Stat label="Budget" value={job.budgetType === "hourly" ? `$${job.budgetMin}-$${job.budgetMax}/hr` : `$${job.budgetMin.toLocaleString()}-$${job.budgetMax.toLocaleString()}`} />
                <Stat label="Type" value={job.budgetType === "hourly" ? "Hourly" : "Fixed price"} />
                <Stat label="Experience" value={job.experienceLevel} className="capitalize" />
                <Stat label="Length" value={job.projectLength.replace(/-/g, " ")} className="capitalize" />
              </div>

              <h3 className="font-semibold text-lg mb-2">Project description</h3>
              <p className="text-muted-foreground whitespace-pre-line mb-6">{job.description}</p>

              <h3 className="font-semibold text-lg mb-3">Skills required</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {job.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>

              {job.questions.length > 0 && (
                <>
                  <h3 className="font-semibold text-lg mb-3">Screening questions</h3>
                  <ul className="space-y-2 mb-6">
                    {job.questions.map((q, i) => (
                      <li key={i} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />{q}</li>
                    ))}
                  </ul>
                </>
              )}

              {job.ndaRequired && <Badge variant="outline" className="border-warning/40 text-warning">NDA required</Badge>}
            </CardContent>
          </Card>
        </motion.div>

        <motion.aside initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <Card>
            <CardContent className="p-6">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full gradient-primary text-primary-foreground border-0" size="lg">Submit a proposal</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Submit your proposal</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Your bid ({job.budgetType === "hourly" ? "$/hr" : "$ total"})</Label>
                      <Input type="number" value={bid} onChange={(e) => setBid(e.target.value)} placeholder="e.g. 75" />
                    </div>
                    <div>
                      <Label>Cover letter</Label>
                      <Textarea value={cover} onChange={(e) => setCover(e.target.value)} rows={6} placeholder="Why you're a great fit..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={submit} disabled={submitting || !bid || !cover}>
                      {submitting ? "Submitting..." : "Submit proposal"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={async () => {
                  if (!isAuthenticated) { nav("/login"); return; }
                  await paymentsApi.fundJob(jobId);
                  toast({ title: "Escrow funding started", description: "Payment intent created." });
                }}
                disabled={!isAuthenticated || !(user?.role ?? '').toLowerCase().includes('client')}
              >
                Fund escrow
              </Button>
              <Button variant="outline" className="w-full mt-2" onClick={() => toggle(job.id)}>
                <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />{saved ? "Saved" : "Save job"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">About the client</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={job.client.avatar} />
                  <AvatarFallback>{job.client.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium flex items-center gap-1">
                    {job.client.name}
                    {job.client.verified && <CheckCircle2 className="h-4 w-4 text-success" />}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{job.client.location}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <Row label="Rating" value={<span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{job.client.rating} ({job.client.reviewsCount})</span>} />
                <Row label="Total spent" value={`$${job.client.totalSpent.toLocaleString()}`} />
                <Row label="Jobs posted" value={job.client.jobsPosted} />
                <Row label="Hire rate" value={`${job.client.hireRate}%`} />
                <Row label="Member since" value={new Date(job.client.memberSince).toLocaleDateString()} />
              </div>
            </CardContent>
          </Card>

          <Button variant="ghost" className="w-full text-muted-foreground"><Flag className="h-4 w-4" />Report this job</Button>
        </motion.aside>
      </div>
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={cn("font-semibold", className)}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>
  );
}
