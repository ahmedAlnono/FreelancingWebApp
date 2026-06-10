import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useQuery } from "@/hooks/useQuery";
import { categoriesApi, Category } from "@/api/endpoints/categories.api";
import { jobsApi } from "@/api/endpoints/jobs.api";
import { mapCategory } from "@/api/adapters/ui.adapters";

const schema = z.object({
  title: z.string().min(8, "Title must be at least 8 characters"),
  categoryId: z.string().min(1, "Pick a category"),
  description: z.string().min(40, "Add more detail (40+ chars)"),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  budgetType: z.enum(["fixed", "hourly"]),
  budgetMin: z.coerce.number().min(1),
  budgetMax: z.coerce.number().min(1),
  experienceLevel: z.enum(["entry", "intermediate", "expert"]),
  projectLength: z.enum(["less-than-1-month", "1-to-3-months", "3-to-6-months", "more-than-6-months"]),
});

type FormValues = z.infer<typeof schema>;

const steps = ["Basics", "Details", "Budget", "Review"];

export default function PostJob() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      title: "", categoryId: "", description: "", skills: [],
      budgetType: "fixed", budgetMin: 500, budgetMax: 2000,
      experienceLevel: "intermediate", projectLength: "1-to-3-months",
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = form;
  const skills = watch("skills");

  const next = async () => {
    const fields: (keyof FormValues)[][] = [["title", "categoryId"], ["description", "skills"], ["budgetType", "budgetMin", "budgetMax", "experienceLevel", "projectLength"], []];
    const ok = await trigger(fields[step]);
    if (ok) setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(0, s - 1));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setValue("skills", [...skills, s], { shouldValidate: true });
    setSkillInput("");
  };
  const removeSkill = (s: string) => setValue("skills", skills.filter((x) => x !== s), { shouldValidate: true });

  const { data: categoriesData } = useQuery<Category[]>(
    ['categories'],
    () => categoriesApi.getAll()
  );
  const categories = (categoriesData ?? []).map(mapCategory);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await jobsApi.createJob({
        title: data.title,
        description: data.description,
        categoryId: Number(data.categoryId),
        budgetType: data.budgetType,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        experienceLevel: data.experienceLevel,
        projectLength: data.projectLength,
        ndaRequired: false,
        requiredSkills: data.skills,
        questions: [],
      });

      toast({ title: "Job posted!", description: `"${data.title}" is now live.` });
      nav("/jobs");
    } finally {
      setSubmitting(false);
    }
  };

  const values = watch();

  return (
    <div className="container py-10 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Post a job</h1>
      <p className="text-muted-foreground mb-8">Tell us about your project — top freelancers will apply.</p>

      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
              i < step ? "bg-success text-success-foreground" : i === step ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <div className="ml-2 text-sm hidden sm:block">{s}</div>
            {i < steps.length - 1 && <div className={cn("h-px flex-1 mx-3", i < step ? "bg-success" : "bg-border")} />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                {step === 0 && (
                  <div className="space-y-5">
                    <div>
                      <Label>Job title *</Label>
                      <Input {...register("title")} placeholder="e.g. Senior React developer for SaaS dashboard" />
                      {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Select value={values.categoryId} onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <Label>Project description *</Label>
                      <Textarea rows={8} {...register("description")} placeholder="Describe what you need built, the problem you're solving..." />
                      {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
                    </div>
                    <div>
                      <Label>Skills *</Label>
                      <div className="flex gap-2">
                        <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                          placeholder="e.g. React, then press Enter" />
                        <Button type="button" onClick={addSkill}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {skills.map((s) => (
                          <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(s)}>{s} ✕</Badge>
                        ))}
                      </div>
                      {errors.skills && <p className="text-xs text-destructive mt-1">{errors.skills.message as string}</p>}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <Label>Budget type</Label>
                      <RadioGroup value={values.budgetType} onValueChange={(v: "fixed" | "hourly") => setValue("budgetType", v)} className="grid grid-cols-2 gap-3 mt-2">
                        {(["fixed", "hourly"] as const).map((t) => (
                          <label key={t} className={cn("border rounded-lg p-4 cursor-pointer", values.budgetType === t && "border-primary bg-accent")}>
                            <RadioGroupItem value={t} className="sr-only" />
                            <div className="font-medium capitalize">{t}</div>
                            <div className="text-xs text-muted-foreground">{t === "fixed" ? "One-time payment for entire project" : "Pay by the hour"}</div>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Min budget ({values.budgetType === "hourly" ? "$/hr" : "$"})</Label>
                        <Input type="number" {...register("budgetMin")} />
                      </div>
                      <div>
                        <Label>Max budget ({values.budgetType === "hourly" ? "$/hr" : "$"})</Label>
                        <Input type="number" {...register("budgetMax")} />
                      </div>
                    </div>
                    <div>
                      <Label>Experience level</Label>
                      <Select value={values.experienceLevel} onValueChange={(v: string) => setValue("experienceLevel", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Project length</Label>
                      <Select value={values.projectLength} onValueChange={(v: string) => setValue("projectLength", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less-than-1-month">Less than 1 month</SelectItem>
                          <SelectItem value="1-to-3-months">1 to 3 months</SelectItem>
                          <SelectItem value="3-to-6-months">3 to 6 months</SelectItem>
                          <SelectItem value="more-than-6-months">More than 6 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">{values.title || "Untitled job"}</h3>
                    <div className="text-sm text-muted-foreground">{categories.find(c => c.id === values.categoryId)?.name}</div>
                    <p className="text-sm">{values.description}</p>
                    <div className="flex flex-wrap gap-1">{values.skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Detail label="Budget" v={values.budgetType === "hourly" ? `$${values.budgetMin}-$${values.budgetMax}/hr` : `$${values.budgetMin}-$${values.budgetMax}`} />
                      <Detail label="Type" v={values.budgetType} />
                      <Detail label="Experience" v={values.experienceLevel} />
                      <Detail label="Length" v={values.projectLength.replace(/-/g, " ")} />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button type="button" variant="ghost" onClick={back} disabled={step === 0}><ChevronLeft className="h-4 w-4" />Back</Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={next} className="gradient-primary text-primary-foreground border-0">Next<ChevronRight className="h-4 w-4" /></Button>
              ) : (
                <Button type="submit" disabled={submitting} className="gradient-primary text-primary-foreground border-0">
                  {submitting ? "Posting..." : "Post job"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded-lg bg-secondary/50 p-3">
      <div className="text-xs text-muted-foreground capitalize">{label}</div>
      <div className="font-medium capitalize">{v}</div>
    </div>
  );
}
