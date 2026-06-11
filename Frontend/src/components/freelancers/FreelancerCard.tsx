import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MapPin, Star, Briefcase } from "lucide-react";
import type { Freelancer } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useShortlistedFreelancers } from "@/hooks/useSavedItems";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export function FreelancerCard({ freelancer, index = 0 }: { freelancer: Freelancer; index?: number }) {
  const { has, toggle } = useShortlistedFreelancers();
  const saved = has(freelancer.id);

  useEffect(()=>{
    console.log(freelancer.avatar);
  },[freelancer])
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04 }}
    >
      <Card className="group hover:border-primary/40 transition-all hover:shadow-elegant overflow-hidden">
        <div className="h-20 gradient-primary opacity-80" />
        <CardContent className="p-6 -mt-10">
          <div className="flex items-start justify-between mb-3">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-card">
                <AvatarImage src={freelancer.avatar} />
                <AvatarFallback>{freelancer.name[0]}</AvatarFallback>
              </Avatar>
              {freelancer.online && <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-success ring-2 ring-card" />}
            </div>
            <Button
              variant="ghost" size="icon"
              onClick={(e) => { e.preventDefault(); toggle(freelancer.id); }}
              className={cn(saved && "text-destructive")}
              aria-label="Shortlist"
            >
              <Heart className={cn("h-4 w-4", saved && "fill-current")} />
            </Button>
          </div>
          <Link to={`/freelancers/${freelancer.id}`}>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{freelancer.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{freelancer.title}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{freelancer.country}</span>
            <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{freelancer.rating} ({freelancer.reviewsCount})</span>
            {freelancer.topRated && <Badge variant="secondary" className="bg-primary/15 text-primary border-primary/30">Top Rated</Badge>}
          </div>
          <p className="text-sm line-clamp-2 mb-4 text-muted-foreground">{freelancer.bio}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {freelancer.skills.slice(0, 4).map((s) => (
              <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
            <span className="font-semibold">${freelancer.hourlyRate}<span className="text-muted-foreground font-normal text-xs">/hr</span></span>
            <span className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" />{freelancer.completedProjects} jobs</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
