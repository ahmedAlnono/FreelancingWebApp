import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bookmark, MapPin, Star, Clock } from "lucide-react";
import type { Job } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSavedJobs } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  const { has, toggle } = useSavedJobs();
  const saved = has(job.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
    >
      <Card className="group hover:border-primary/40 transition-all hover:shadow-elegant">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {timeAgo(job.postedAt)}
              {job.featured && <Badge variant="secondary" className="bg-warning/15 text-warning border-warning/30">Featured</Badge>}
            </div>
            <Button
              variant="ghost" size="icon"
              onClick={(e) => { e.preventDefault(); toggle(job.id); }}
              className={cn("h-8 w-8 shrink-0", saved && "text-primary")}
              aria-label={saved ? "Unsave job" : "Save job"}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </Button>
          </div>

          <Link to={`/jobs/${job.id}`}>
            <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
              {job.title}
            </h3>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="capitalize">{job.budgetType === "hourly" ? `$${job.budgetMin}-$${job.budgetMax}/hr` : `$${job.budgetMin.toLocaleString()}-$${job.budgetMax.toLocaleString()} fixed`}</span>
            <span>·</span>
            <span className="capitalize">{job.experienceLevel}</span>
            <span>·</span>
            <span className="capitalize">{job.projectLength.replace(/-/g, " ")}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{job.description}</p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.slice(0, 5).map((s) => (
              <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-3">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span className="font-medium text-foreground">{job.client.rating}</span>
              <span>({job.client.reviewsCount})</span>
              {job.client.verified && <Badge variant="outline" className="ml-1 text-[10px] px-1 py-0">Verified</Badge>}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {job.client.country}
            </div>
            <div>{job.proposalsCount} proposals</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
