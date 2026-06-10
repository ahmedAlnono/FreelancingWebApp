import { motion } from "framer-motion";
import { MapPin, Star, Briefcase, Clock, TrendingUp, MessageSquare, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { freelancersApi } from "@/api/endpoints/freelancers.api";
import { useQuery } from "@/hooks/useQuery";
import { mapFreelancerDetail } from "@/api/adapters/ui.adapters";
import { uploadApi } from "@/api/endpoints/upload.api";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  const isFreelancer = (user?.role ?? '').toLowerCase().includes('freelancer');

  const { data: freelancerDetail } = useQuery(
    ['freelancer-profile', user?.id],
    () => freelancersApi.getFreelancerById(user!.id),
    { enabled: !!user?.id && isFreelancer }
  );
  const f = freelancerDetail ? mapFreelancerDetail(freelancerDetail) : null;
  const displayName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.username || 'User';
  return (
    <div className="container py-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden mb-6">
          <div className="h-40 gradient-primary" />
          <CardContent className="p-6 -mt-16 relative">
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex flex-col items-start gap-2">
                <Avatar className="h-28 w-28 ring-4 ring-card">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{displayName[0]}</AvatarFallback>
                </Avatar>
                <label className="text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !user) return;
                      setUploading(true);
                      try {
                        const res = await uploadApi.uploadProfileImage(file);
                        if (res.success) {
                          updateUser({ ...user, avatar: res.data });
                          toast({ title: "Profile image updated" });
                        }
                        console.log(res);
                      } finally {
                        setUploading(false);
                        e.target.value = "";
                      }
                    }}
                  />
                  {uploading ? "Uploading…" : "Change photo"}
                </label>
              </div>
              <div className="flex-1 md:pt-16">
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold">{displayName}</h1>
                    <p className="text-muted-foreground">{f?.title ?? (isFreelancer ? "Freelancer" : "Client")}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{f?.location ?? user?.location ?? "—"}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{f?.rating ?? 0}</span>
                    </div>
                  </div>
                  <Button variant="outline"><Edit className="h-4 w-4" />Edit profile</Button>
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
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="about" className="space-y-4 mt-6">
                <Card><CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-sm text-muted-foreground">{f?.bio ?? "—"}</p>
                </CardContent></Card>
                <Card><CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">{(f?.skills ?? []).map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="portfolio" className="grid sm:grid-cols-2 gap-4 mt-6">
                {(f?.portfolio ?? []).map((p) => (
                  <Card key={p.id} className="overflow-hidden">
                    <img src={p.image} alt={p.title} className="h-44 w-full object-cover" />
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{p.title}</h4>
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="reviews" className="space-y-3 mt-6">
                {(f?.reviews ?? []).map((r) => (
                  <Card key={r.id}><CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-8 w-8"><AvatarImage src={r.reviewerAvatar} /></Avatar>
                      <div className="font-medium text-sm">{r.reviewerName}</div>
                    </div>
                    <p className="text-sm">{r.comment}</p>
                  </CardContent></Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
          <aside>
            <Card><CardContent className="p-6 space-y-3 text-sm">
              <h3 className="font-semibold">Stats</h3>
              <Separator />
              <Row icon={Briefcase} label="Projects" v={f?.completedProjects ?? 0} />
              <Row icon={Clock} label="Hours" v={(f?.hoursWorked ?? 0).toLocaleString()} />
              <Row icon={TrendingUp} label="Earnings" v={`$${(((f?.totalEarnings ?? 0) as number) / 1000).toFixed(0)}k`} />
              <Row icon={MessageSquare} label="Response" v={`${f?.responseRate ?? 0}%`} />
            </CardContent></Card>
          </aside>
        </div>
      </motion.div>
    </div>
  );
}

function Row({ icon: Icon, label, v }: { icon: React.ElementType; label: string; v: string | number }) {
  return <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" />{label}</span><span className="font-medium">{v}</span></div>;
}
