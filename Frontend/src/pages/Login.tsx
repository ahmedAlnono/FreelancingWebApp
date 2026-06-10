import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type Values = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Values) => {
    setLoading(true);
    try {
      await login({ email: data.email, password: data.password });
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      nav("/dashboard");
    } catch (error: unknown) {
      toast({ 
        title: "Login failed", 
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="container py-16 grid lg:grid-cols-2 gap-12 items-center">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:block">
        <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-6 shadow-elegant">
          <Briefcase className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Welcome back to <span className="text-gradient">WorkHive</span></h1>
        <p className="text-muted-foreground text-lg">Sign in to manage your projects, proposals, and conversations — all in one place.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <Card className="max-w-md mx-auto w-full">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-1">Log in</h2>
            <p className="text-sm text-muted-foreground mb-6">Use any email — this is a demo.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" {...register("email")} placeholder="you@example.com" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" {...register("password")} placeholder="••••••••" />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={loading}>
                {loading ? "Signing in..." : "Log in"}
              </Button>
            </form>
            <p className="text-sm text-center text-muted-foreground mt-6">
              Don't have an account? <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
