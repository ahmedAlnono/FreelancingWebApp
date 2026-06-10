import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { JobCard } from "@/components/jobs/JobCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExperienceLevel, BudgetType } from "@/types";
import { useQuery } from "@/hooks/useQuery";
import { categoriesApi, Category } from "@/api/endpoints/categories.api";
import { useJobs } from "@/hooks/useJobs";
import { mapCategory, mapJob } from "@/api/adapters/ui.adapters";

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const initialCat = params.get("category") ?? "";

  const [q, setQ] = useState(initialQ);
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCat ? [initialCat] : []);
  const [budgetType, setBudgetType] = useState<"all" | BudgetType>("all");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 30000]);
  const [levels, setLevels] = useState<ExperienceLevel[]>([]);
  const [sort, setSort] = useState<"recent" | "budget-high" | "budget-low" | "proposals">("recent");

  const toggleCat = (slug: string) => setSelectedCats((p) => p.includes(slug) ? p.filter(x => x !== slug) : [...p, slug]);
  const toggleLevel = (l: ExperienceLevel) => setLevels((p) => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);

  const { data: categoriesData } = useQuery<Category[]>(
    ['categories'],
    () => categoriesApi.getAll()
  );
  const categories = (categoriesData ?? []).map(mapCategory);

  const selectedCategoryId = useMemo(() => {
    const slug = selectedCats[0];
    if (!slug) return undefined;
    const cat = (categoriesData ?? []).find(c => c.slug === slug);
    return cat?.id;
  }, [categoriesData, selectedCats]);

  const jobsQueryParams = useMemo(() => ({
    page: 1,
    pageSize: 20,
    search: q || undefined,
    categoryId: selectedCategoryId,
    budgetType: budgetType === 'all' ? undefined : budgetType,
    minBudget: budgetRange[0],
    maxBudget: budgetRange[1],
    experienceLevel: levels[0],
    sortBy: sort,
  }), [q, selectedCategoryId, budgetType, budgetRange, levels, sort]);

  const { jobs: apiJobs, totalCount, isLoading } = useJobs(jobsQueryParams);
  const filtered = useMemo(() => apiJobs.map(mapJob), [apiJobs]);

  const Filters = (
    <div className="space-y-6">
      <div>
        <h4 className="font-semibold mb-3 text-sm">Categories</h4>
        <div className="space-y-2">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
              <Checkbox checked={selectedCats.includes(c.slug)} onCheckedChange={() => toggleCat(c.slug)} />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-sm">Budget type</h4>
        <Select value={budgetType} onValueChange={(v: "all" | "hourly" | "fixed") => setBudgetType(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="hourly">Hourly</SelectItem>
            <SelectItem value="fixed">Fixed price</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-sm">Budget range</h4>
        <Slider value={budgetRange} min={0} max={30000} step={500} onValueChange={(v) => setBudgetRange([v[0], v[1]] as [number, number])} />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>${budgetRange[0].toLocaleString()}</span>
          <span>${budgetRange[1].toLocaleString()}+</span>
        </div>
      </div>
      <div>
        <h4 className="font-semibold mb-3 text-sm">Experience level</h4>
        <div className="space-y-2">
          {(["entry", "intermediate", "expert"] as ExperienceLevel[]).map((l) => (
            <label key={l} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
              <Checkbox checked={levels.includes(l)} onCheckedChange={() => toggleLevel(l)} />
              {l}
            </label>
          ))}
        </div>
      </div>
      <Button variant="ghost" className="w-full" onClick={() => { setSelectedCats([]); setBudgetType("all"); setBudgetRange([0, 30000]); setLevels([]); }}>
        <X className="h-4 w-4" /> Clear filters
      </Button>
    </div>
  );

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Find your next gig</h1>
        <p className="text-muted-foreground">{totalCount} jobs available</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setParams(p => { p.set("q", e.target.value); return p; }); }}
            placeholder="Search jobs, skills..." className="pl-9 h-11" />
        </div>
        <Select value={sort} onValueChange={(v: "recent" | "budget-low" | "budget-high" | "proposals") => setSort(v)}>
          <SelectTrigger className="md:w-56 h-11"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most recent</SelectItem>
            <SelectItem value="budget-high">Highest budget</SelectItem>
            <SelectItem value="budget-low">Lowest budget</SelectItem>
            <SelectItem value="proposals">Fewest proposals</SelectItem>
          </SelectContent>
        </Select>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden h-11"><SlidersHorizontal className="h-4 w-4" />Filters</Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-6">{Filters}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden md:block">
          <Card><CardContent className="p-5">{Filters}</CardContent></Card>
        </aside>
        <div className="space-y-4">
          {isLoading ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">Loading jobs…</CardContent></Card>
          ) : filtered.length === 0 ? (
            <Card><CardContent className="p-12 text-center text-muted-foreground">
              No jobs match your filters. Try clearing them.
            </CardContent></Card>
          ) : filtered.map((j, i) => <JobCard key={j.id} job={j} index={i} />)}
        </div>
      </div>
    </div>
  );
}
