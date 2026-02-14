"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { GlassCard } from "@/components/glass-card";
import {
  RotateCcw,
  QrCode,
  Brain,
  Truck,
  Shield,
  BarChart3,
  ArrowRight,
  Package,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const features = [
  {
    icon: <RotateCcw className="h-6 w-6" />,
    title: "Smart Returns",
    description: "Intelligent return processing with automated approval workflows and trust scoring.",
  },
  {
    icon: <QrCode className="h-6 w-6" />,
    title: "QR Drop Box",
    description: "Generate QR codes for seamless drop-box returns at convenient locations.",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI Analysis",
    description: "AI-powered damage detection analyzes product images for instant decisions.",
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Pickup Scheduling",
    description: "Schedule home pickup for returns with real-time logistics tracking.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Trust Scoring",
    description: "Dynamic customer trust scores to prevent fraudulent returns.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Analytics Dashboard",
    description: "Comprehensive analytics for return trends, costs, and category insights.",
  },
];

const trustBadges = [
  { icon: <Users className="h-4 w-4" />, text: "10K+ Brands" },
  { icon: <TrendingUp className="h-4 w-4" />, text: "95% Satisfaction" },
  { icon: <Zap className="h-4 w-4" />, text: "2M+ Returns" },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (data.credentials) {
        toast.success("Database seeded! Check the demo credentials below.");
      } else {
        toast.info(data.message);
      }
    } catch {
      toast.error("Failed to seed database. Make sure MongoDB is connected.");
    }
    setSeeding(false);
  };

  const dashboardLink = user ? `/${user.role}/dashboard` : "/login";

  // Handle scroll effect for navbar
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setScrolled(window.scrollY > 10);
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#e8f3f8] to-[#f5f7ff]">
      {/* Enhanced Navbar with scroll shadow */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong shadow-lg" : "glass-strong"
      } flex items-center justify-between px-6 py-3`}>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <RotateCcw className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Vector</span>
        </div>
        <div className="flex items-center gap-3">
          {isLoading ? null : user ? (
            <Link href={dashboardLink}>
              <Button className="shadow-md hover:shadow-lg transition-shadow">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-primary/10">Login</Button>
              </Link>
              <Link href="/signup">
                <Button className="shadow-md hover:shadow-lg transition-shadow">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="h-16" />

      {/* Enhanced Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 py-24 text-center lg:py-32 overflow-hidden">
        {/* Modern Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* Soft geometric shapes */}
          <div className="absolute top-20 right-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-400/10 blur-2xl animate-pulse" />
          <div className="absolute bottom-20 left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/4 h-24 w-24 rounded-full bg-gradient-to-bl from-cyan-400/10 to-blue-400/10 blur-2xl animate-pulse delay-500" />
          
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/20" />
        </div>

        {/* Enhanced Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/60 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm shadow-sm">
          <Sparkles className="h-4 w-4" />
          Fashion D2C Return Management
        </div>

        {/* Enhanced Headline with gradient */}
        <div className="mb-12 max-w-4xl">
          <h1 className="text-balance text-4xl font-extrabold leading-[1.2] tracking-tight text-foreground md:text-6xl lg:text-7xl mb-8">
            Returns Made{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Intelligent
            </span>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-pretty text-lg text-muted-foreground/70 md:text-xl max-w-2xl mx-auto leading-relaxed">
            Streamline your return and exchange process with AI-powered analysis, QR drop-box returns,
            and automated n8n workflows. Built for modern fashion brands.
          </p>
        </div>

        {/* Enhanced Buttons */}
        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link href={user ? dashboardLink : "/signup"}>
            <Button 
              size="lg" 
              className="gap-2 px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90"
            >
              {user ? "Go to Dashboard" : "Start Free"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleSeed} 
            disabled={seeding}
            className="px-8 py-4 text-lg transition-all duration-300 hover:scale-105 hover:bg-primary/10 border-primary/30"
          >
            {seeding ? "Seeding..." : "Seed Demo Data"}
          </Button>
        </div>

        {/* Collapsible Demo Credentials */}
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowDemo(!showDemo)}
            className="mx-auto flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showDemo ? "rotate-180" : ""}`} />
            {showDemo ? "Hide" : "Show"} demo credentials
          </button>
          
          {showDemo && (
            <div className="mt-3 rounded-lg bg-white/80 p-4 text-xs text-muted-foreground/60 backdrop-blur-sm border border-border/50 shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1">
                <div>customer@vector.com / admin@vector.com</div>
                <div>warehouse@vector.com / logistics@vector.com</div>
                <div className="pt-1 border-t border-border/30">password: password123</div>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Mockup */}
        <div className="mt-16 hidden lg:block">
          <div className="relative animate-float">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[600px] h-[400px] overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <RotateCcw className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">Vector Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">247</div>
                  <div className="text-sm text-blue-600/70">Active Returns</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">89%</div>
                  <div className="text-sm text-green-600/70">Approval Rate</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">4.8</div>
                  <div className="text-sm text-purple-600/70">Avg Rating</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">2.3h</div>
                  <div className="text-sm text-orange-600/70">Avg Process Time</div>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-purple-500 rounded-full"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2">
              {badge.icon}
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-16 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl mb-4">
            Everything You Need to Scale Returns
          </h2>
          <p className="mt-3 text-muted-foreground/70 text-lg max-w-2xl mx-auto">
            A complete return management ecosystem designed for modern fashion brands.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <GlassCard 
              key={feature.title} 
              hover
              className="group transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground/70">{feature.description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Enhanced Role Panels */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-16 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl mb-4">
            Role-Based Intelligence
          </h2>
          <p className="mt-3 text-muted-foreground/70 text-lg max-w-2xl mx-auto">
            Dedicated interfaces for every stakeholder in the return lifecycle.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { role: "Customer", desc: "View orders, request returns, upload images, generate QR codes, track status.", color: "bg-gradient-to-r from-blue-500/10 to-blue-600/10 text-blue-600 border-blue-200/50" },
            { role: "Admin", desc: "Approve or reject returns, view AI analysis, monitor analytics and automation.", color: "bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-600 border-emerald-200/50" },
            { role: "Warehouse", desc: "Confirm product receipt, scan QR codes, update inventory counts.", color: "bg-gradient-to-r from-amber-500/10 to-amber-600/10 text-amber-600 border-amber-200/50" },
            { role: "Logistics", desc: "Update pickup status, manage delivery scheduling and routes.", color: "bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 text-cyan-600 border-cyan-200/50" },
          ].map((panel, index) => (
            <GlassCard 
              key={panel.role} 
              hover
              className="group transition-all duration-300 hover:scale-105 hover:shadow-xl border"
            >
              <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${panel.color} border`}>
                {panel.role}
              </span>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground/70">{panel.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm px-6 py-12 text-center text-sm text-muted-foreground/70">
        <div className="mb-4">
          <p className="font-semibold text-foreground">Vector</p>
          <p className="mt-1">Intelligent Return Management System</p>
        </div>
        <p className="text-xs">Built with Next.js, MongoDB, and n8n Automation</p>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle at center, transparent 0%, rgba(255,255,255,0.1) 100%);
        }
      `}</style>
    </div>
  );
}
