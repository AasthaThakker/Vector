"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoveRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(`/${user.role}/dashboard`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    }
    setLoading(false);
  };

  const quickLogin = async (email: string) => {
    setLoading(true);
    try {
      const user = await login(email, "password123");
      toast.success(`Logged in as ${user.name}`);
      router.push(`/${user.role}/dashboard`);
    } catch {
      toast.error("Login failed. Did you seed the database?");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <GlassCard className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg">
              <MoveRight className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Vector</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6">
          <p className="mb-3 text-center text-xs font-medium text-muted-foreground">Quick Login (Demo)</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Customer", email: "customer@vector.com" },
              { label: "Admin", email: "admin@vector.com" },
              { label: "Warehouse", email: "warehouse@vector.com" },
              { label: "Logistics", email: "logistics@vector.com" },
            ].map((demo) => (
              <Button
                key={demo.email}
                variant="outline"
                size="sm"
                onClick={() => quickLogin(demo.email)}
                disabled={loading}
              >
                {demo.label}
              </Button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
