import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { FreelancerCard } from "@/components/freelancers/FreelancerCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExperienceLevel } from "@/types";
import { freelancersApi } from "@/api/endpoints/freelancers.api";
import { useQuery } from "@/hooks/useQuery";
import { mapFreelancer } from "@/api/adapters/ui.adapters";

export default function Freelancers() {
  const [q, setQ] = useState("");
  const [rate, setRate] = useState<[number, number]>([0, 200]);
  const [levels, setLevels] = useState<ExperienceLevel[]>([]);
  const [topOnly, setTopOnly] = useState(false);
  const [availOnly, setAvailOnly] = useState(false);
  const [sort, setSort] = useState<"rating" | "rate-low" | "rate-high" | "projects">("rating");

  const toggleLevel = (l: ExperienceLevel) => setLevels((p) => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const { data: result, isLoading } = useQuery(
    ['freelancers', { q, minRate: rate[0], maxRate: rate[1], availability: availOnly ? 'available' : undefined }],
    () => freelancersApi.getFreelancers({
      search: q || undefined,
      minRate: rate[0],
      maxRate: rate[1],
      availability: availOnly ? 'available' : undefined,
      page: 1,
      pageSize: 50,
    })
  );

  const filtered = useMemo(() => {
    const list = (result?.items ?? []).map(mapFreelancer).filter((f) => {
      if (levels.length && !levels.includes(f.level)) return false;
      if (topOnly && !f.topRated) return false;
      return true;
    });

    list.sort((a, b) => {
      switch (sort) {
        case "rate-low": return a.hourlyRate - b.hourlyRate;
        case "rate-high": return b.hourlyRate - a.hourlyRate;
        case "projects": return b.completedProjects - a.completedProjects;
        default: return b.rating - a.rating;
      }
    });
    return list;
  }, [result, levels, topOnly, sort]);

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Find world-class talent</h1>
        <p className="text-muted-foreground">{isLoading ? "Loading…" : `${filtered.length} freelancers ready to work`}</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, skill..." className="pl-9 h-11" />
        </div>
        <Select value={sort} onValueChange={(v: "rating" | "rate-low" | "rate-high" | "projects") => setSort(v)}>
          <SelectTrigger className="md:w-56 h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest rated</SelectItem>
            <SelectItem value="rate-low">Lowest rate</SelectItem>
            <SelectItem value="rate-high">Highest rate</SelectItem>
            <SelectItem value="projects">Most projects</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden md:block">
          <Card><CardContent className="p-5 space-y-6">
            <div>
              <h4 className="font-semibold mb-3 text-sm">Hourly rate</h4>
              <Slider value={rate} min={0} max={200} step={5} onValueChange={(v) => setRate([v[0], v[1]] as [number, number])} />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>${rate[0]}</span><span>${rate[1]}+</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Experience level</h4>
              <div className="space-y-2">
                {(["entry", "intermediate", "expert"] as ExperienceLevel[]).map((l) => (
                  <label key={l} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
                    <Checkbox checked={levels.includes(l)} onCheckedChange={() => toggleLevel(l)} />{l}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox checked={topOnly} onCheckedChange={(v) => setTopOnly(!!v)} />Top rated only
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox checked={availOnly} onCheckedChange={(v) => setAvailOnly(!!v)} />Available now
              </label>
            </div>
            <Button variant="ghost" className="w-full" onClick={() => { setRate([0, 200]); setLevels([]); setTopOnly(false); setAvailOnly(false); }}>
              <X className="h-4 w-4" />Clear filters
            </Button>
          </CardContent></Card>
        </aside>

        <div className="grid sm:grid-cols-2 gap-4 self-start">
          {isLoading ? (
            <Card className="col-span-full"><CardContent className="p-12 text-center text-muted-foreground">Loading freelancers…</CardContent></Card>
          ) : filtered.length === 0 ? (
            <Card className="col-span-full"><CardContent className="p-12 text-center text-muted-foreground">No freelancers match your filters.</CardContent></Card>
          ) : filtered.map((f, i) => <FreelancerCard key={f.id} freelancer={f} index={i} />)}
        </div>
      </div>
    </div>
  );
}
