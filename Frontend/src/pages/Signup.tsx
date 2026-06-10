import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase, User, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type Values = z.infer<typeof schema>;

export default function Signup() {
  const { register: signup } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState<"freelancer" | "client">("freelancer");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: Values) => {
    setLoading(true);
    try {
      const [firstName, ...lastNameParts] = d.name.split(" ");
      await signup({
        email: d.email,
        username: d.email.split("@")[0], // Placeholder username
        password: d.password,
        firstName,
        lastName: lastNameParts.join(" "),
        userType: role
      });
      toast({ title: "Account created!", description: "Welcome to WorkHive." });
      nav("/dashboard");
    } catch (error: unknown) {
      toast({ 
        title: "Signup failed", 
        description: error instanceof Error ? error.message : "An error occurred during signup",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elegant">
            <Briefcase className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Join <span className="text-gradient">WorkHive</span></h1>
          <p className="text-muted-foreground">Create your free account in seconds.</p>
        </div>

        <Card>
          <CardContent className="p-8">
            <Label className="block mb-3">I want to...</Label>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {([
                { v: "freelancer", icon: User, label: "Find work", desc: "I'm a freelancer" },
                { v: "client", icon: Building2, label: "Hire talent", desc: "I'm a client" },
              ] as const).map((r) => (
                <button key={r.v} type="button" onClick={() => setRole(r.v)}
                  className={cn("border rounded-lg p-4 text-left transition-all", role === r.v ? "border-primary bg-accent shadow-elegant" : "hover:border-primary/40")}>
                  <r.icon className={cn("h-5 w-5 mb-2", role === r.v ? "text-primary" : "text-muted-foreground")} />
                  <div className="font-medium text-sm">{r.label}</div>
                  <div className="text-xs text-muted-foreground">{r.desc}</div>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Full name</Label>
                <Input {...register("name")} placeholder="Jane Doe" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" {...register("email")} placeholder="you@example.com" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" {...register("password")} placeholder="At least 6 characters" />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="text-sm text-center text-muted-foreground mt-6">
              Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
