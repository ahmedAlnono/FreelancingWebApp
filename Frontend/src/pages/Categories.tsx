import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@/hooks/useQuery";
import { categoriesApi, Category } from "@/api/endpoints/categories.api";
import { mapCategory } from "@/api/adapters/ui.adapters";

export default function Categories() {
  const { data, isLoading } = useQuery<Category[]>(
    ['categories'],
    () => categoriesApi.getAll()
  );

  const categories = (data ?? []).map(mapCategory);

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-3">Browse all categories</h1>
        <p className="text-muted-foreground">Explore opportunities across every domain.</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <Card className="col-span-full"><CardContent className="p-10 text-center text-muted-foreground">Loading categories…</CardContent></Card>
        ) : categories.map((c, i) => {
          const Icon = (Icons as any as Record<string, Icons.LucideIcon>)[c.icon] || Briefcase;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/jobs?category=${c.slug}`}>
                <Card className="hover:border-primary/40 hover:shadow-elegant transition-all group h-full">
                  <CardContent className="p-6 flex gap-4">
                    <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center group-hover:gradient-primary transition-all shrink-0">
                      <Icon className="h-7 w-7 text-accent-foreground group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{c.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{c.description}</p>
                      <p className="text-xs text-muted-foreground">{c.jobCount.toLocaleString()} open jobs</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
