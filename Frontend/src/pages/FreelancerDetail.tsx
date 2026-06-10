import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MapPin, MessageSquare, Star, Briefcase, Clock, TrendingUp, Globe, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useShortlistedFreelancers } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";
import { freelancersApi } from "@/api/endpoints/freelancers.api";
import { useQuery } from "@/hooks/useQuery";
import { mapFreelancerDetail } from "@/api/adapters/ui.adapters";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { reviewsApi } from "@/api/endpoints/reviews.api";
import { toast } from "@/hooks/use-toast";

export default function FreelancerDetail() {
  const { id } = useParams();
  const freelancerId = Number(id);
  const { data, isLoading } = useQuery(
    ['freelancer', freelancerId],
    () => freelancersApi.getFreelancerById(freelancerId),
    { enabled: Number.isFinite(freelancerId) && freelancerId > 0 }
  );
  const f = data ? mapFreelancerDetail(data) : null;
  const nav = useNavigate();
  const { has, toggle } = useShortlistedFreelancers();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewJobId, setReviewJobId] = useState("");
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewText, setReviewText] = useState("");

  if (isLoading) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        Loading freelancer…
      </div>
    );
  }

  if (!f) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-semibold mb-4">Freelancer not found</h2>
        <Button asChild><Link to="/freelancers">Back to talent</Link></Button>
      </div>
    );
  }

  const saved = has(f.id);

  return (
    <div className="container py-6">
      <Button variant="ghost" onClick={() => nav(-1)} className="mb-4"><ArrowLeft className="h-4 w-4" />Back</Button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden mb-6">
          <div className="h-40 md:h-56 gradient-primary relative">
            <img src={f.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
          </div>
          <CardContent className="p-6 md:p-8 -mt-16 md:-mt-20 relative">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative">
                <Avatar className="h-28 w-28 md:h-36 md:w-36 ring-4 ring-card">
                  <AvatarImage src={f.avatar} />
                  <AvatarFallback className="text-2xl">{f.name[0]}</AvatarFallback>
                </Avatar>
                {f.online && <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full bg-success ring-2 ring-card" />}
              </div>
              <div className="flex-1 md:pt-16">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold">{f.name}</h1>
                      {f.topRated && <Badge className="gradient-primary text-primary-foreground border-0"><Award className="h-3 w-3" />Top Rated</Badge>}
                    </div>
                    <p className="text-lg text-muted-foreground mb-2">{f.title}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{f.location}</span>
                      <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-warning text-warning" />{f.rating} ({f.reviewsCount} reviews)</span>
                      <span className="flex items-center gap-1 capitalize"><span className={cn("h-2 w-2 rounded-full", f.availability === "available" ? "bg-success" : "bg-warning")} />{f.availability}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => toggle(f.id)} className={cn(saved && "text-destructive border-destructive")}>
                      <Heart className={cn("h-4 w-4", saved && "fill-current")} />
                    </Button>
                    <Button asChild variant="outline"><Link to="/messages"><MessageSquare className="h-4 w-4" />Message</Link></Button>
                    <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Leave review</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Leave a review</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Job ID</Label>
                            <Input value={reviewJobId} onChange={(e) => setReviewJobId(e.target.value)} placeholder="e.g. 123" />
                          </div>
                          <div>
                            <Label>Rating (1–5)</Label>
                            <Input type="number" min={1} max={5} value={reviewRating} onChange={(e) => setReviewRating(e.target.value)} />
                          </div>
                          <div>
                            <Label>Feedback</Label>
                            <Textarea rows={5} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience…" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={async () => {
                              await reviewsApi.createReview({
                                revieweeId: freelancerId,
                                jobId: Number(reviewJobId),
                                rating: Number(reviewRating),
                                feedback: reviewText,
                              });
                              setReviewOpen(false);
                              toast({ title: "Review submitted" });
                            }}
                            disabled={!reviewJobId || !reviewText}
                          >
                            Submit
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button className="gradient-primary text-primary-foreground border-0">Hire {f.name.split(" ")[0]}</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div>
            <Tabs defaultValue="about">
              <TabsList>
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({f.reviewsCount})</TabsTrigger>
                <TabsTrigger value="history">Work history</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6 mt-6">
                <Card><CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Bio</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{f.bio}</p>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {f.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                  </div>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Globe className="h-4 w-4" />Languages</h3>
                  <ul className="space-y-1 text-sm">
                    {f.languages.map((l) => (
                      <li key={l.name} className="flex justify-between"><span>{l.name}</span><span className="text-muted-foreground">{l.level}</span></li>
                    ))}
                  </ul>
                </CardContent></Card>
              </TabsContent>

              <TabsContent value="portfolio" className="mt-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {f.portfolio.map((p) => (
                    <Card key={p.id} className="overflow-hidden hover:shadow-elegant transition-shadow">
                      <img src={p.image} alt={p.title} className="w-full h-44 object-cover" />
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1">{p.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {p.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4 mt-6">
                {f.reviews.map((r) => (
                  <Card key={r.id}><CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Avatar><AvatarImage src={r.reviewerAvatar} /><AvatarFallback>{r.reviewerName[0]}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">{r.reviewerName}</div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("h-3 w-3", i < r.rating ? "fill-warning text-warning" : "text-muted-foreground")} />
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">{r.jobTitle} · {new Date(r.date).toLocaleDateString()}</div>
                        <p className="text-sm">{r.comment}</p>
                      </div>
                    </div>
                  </CardContent></Card>
                ))}
              </TabsContent>

              <TabsContent value="history" className="space-y-3 mt-6">
                {f.workHistory.map((h) => (
                  <Card key={h.id}><CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">{h.jobTitle}</div>
                        <div className="text-xs text-muted-foreground">{h.clientName} · {new Date(h.startDate).toLocaleDateString()} – {new Date(h.endDate).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${h.amount.toLocaleString()}</div>
                        <div className="flex items-center gap-0.5 justify-end">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={cn("h-3 w-3", i < h.rating ? "fill-warning text-warning" : "text-muted-foreground")} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground italic">"{h.feedback}"</p>
                  </CardContent></Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-4">
            <Card><CardContent className="p-6">
              <div className="text-3xl font-bold text-gradient mb-1">${f.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/hr</span></div>
              <Separator className="my-4" />
              <div className="space-y-3 text-sm">
                <Stat icon={Briefcase} label="Projects completed" value={f.completedProjects} />
                <Stat icon={Clock} label="Hours worked" value={f.hoursWorked.toLocaleString()} />
                <Stat icon={TrendingUp} label="Total earnings" value={`$${(f.totalEarnings / 1000).toFixed(0)}k+`} />
                <Stat icon={MessageSquare} label="Response rate" value={`${f.responseRate}%`} />
              </div>
            </CardContent></Card>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground flex items-center gap-2"><Icon className="h-4 w-4" />{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
