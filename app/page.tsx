"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  ArrowRight,
  RotateCcw,
  QrCode,
  Brain,
  Truck,
  Shield,
  BarChart3,
  ChevronDown,
  TrendingUp,
  Users,
  Zap,
  MoveRight,
  Box,
  Package,
  MapPin,
  Sparkles,
  Activity,
  CheckCircle2,
  Play,
  Star,
  Building2,
  Shirt,
  ScanLine,
  Clock,
  Wallet,
  Lock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const features = [
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI-Powered Validation",
    description: "Computer vision analyzes product images with 95% accuracy for instant return decisions.",
    color: "from-blue-500 to-indigo-600",
    lightColor: "bg-blue-50 text-blue-600"
  },
  {
    icon: <ScanLine className="h-6 w-6" />,
    title: "QR Drop Box Network",
    description: "Seamless drop-off experience with QR codes at 500+ locations nationwide.",
    color: "from-amber-500 to-orange-600",
    lightColor: "bg-amber-50 text-amber-600"
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Smart Logistics",
    description: "AI-optimized pickup routes reducing delivery time by 40% and fuel costs by 25%.",
    color: "from-emerald-500 to-teal-600",
    lightColor: "bg-emerald-50 text-emerald-600"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Trust Score System",
    description: "Dynamic fraud prevention with behavioral analysis protecting $50M+ in merchandise.",
    color: "from-cyan-500 to-sky-600",
    lightColor: "bg-cyan-50 text-cyan-600"
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Real-Time Analytics",
    description: "Live dashboards tracking returns, costs, and customer satisfaction metrics.",
    color: "from-purple-500 to-violet-600",
    lightColor: "bg-purple-50 text-purple-600"
  },
  {
    icon: <Wallet className="h-6 w-6" />,
    title: "Instant Refunds",
    description: "Automated refund processing with same-day payouts to customer accounts.",
    color: "from-rose-500 to-pink-600",
    lightColor: "bg-rose-50 text-rose-600"
  }
];

const stats = [
  { value: "95%", label: "Customer Satisfaction", subtext: "Industry Leading" },
  { value: "2M+", label: "Returns Processed", subtext: "Monthly Volume" },
  { value: "10K+", label: "Fashion Brands", subtext: "Global Partners" },
  { value: "24h", label: "Avg. Resolution Time", subtext: "Lightning Fast" },
];

const trustedBrands = [
  "Zara", "H&M", "Nike", "Adidas", "Uniqlo", "Gap", "Levi's", "Puma"
];

const howItWorks = [
  {
    step: "01",
    title: "Initiate Return",
    description: "Customer scans QR or requests pickup through the branded portal",
    icon: <QrCode className="h-5 w-5" />
  },
  {
    step: "02",
    title: "AI Verification",
    description: "Computer vision validates product condition and authenticity",
    icon: <Brain className="h-5 w-5" />
  },
  {
    step: "03",
    title: "Smart Routing",
    description: "System assigns optimal logistics path based on product and location",
    icon: <MapPin className="h-5 w-5" />
  },
  {
    step: "04",
    title: "Instant Resolution",
    description: "Automated refund or exchange processed within 24 hours",
    icon: <CheckCircle2 className="h-5 w-5" />
  }
];

const testimonials = [
  {
    quote: "Vector reduced our return processing time by 60%. The AI validation is incredibly accurate.",
    author: "Sarah Chen",
    role: "COO, StyleHub Fashion",
    metric: "60% faster"
  },
  {
    quote: "The QR drop-box system transformed our customer experience. Returns are now frictionless.",
    author: "Michael Torres",
    role: "Head of Operations, TrendWear",
    metric: "40% cost reduction"
  },
  {
    quote: "We saved $2M annually on logistics costs while improving customer satisfaction scores.",
    author: "Emma Wilson",
    role: "VP Logistics, Global Apparel Co",
    metric: "$2M saved"
  }
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100" 
          : "bg-transparent"
      }`}>
        <div className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-xl">
              <MoveRight className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              Vector
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Testimonials</a>
          </nav>

          <div className="flex items-center gap-3">
            {isLoading ? null : user ? (
              <Link href={dashboardLink}>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all hover:shadow-xl">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" className="text-slate-600 hover:text-slate-900 font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all hover:shadow-xl">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="h-20" />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50/50 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-violet-50/30 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-left">
              <Badge className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-900 text-white border-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" />
                AI-Powered Returns Platform
              </Badge>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Where Returns
                <br />
                <span className="relative">
                  Go Vector
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path d="M2 10C50 4 100 2 150 2C200 2 250 4 298 10" stroke="url(#gradient)" strokeWidth="4" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gradient" x1="2" y1="10" x2="298" y2="10" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#3B82F6"/>
                        <stop offset="0.5" stopColor="#8B5CF6"/>
                        <stop offset="1" stopColor="#EC4899"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed mb-4 max-w-xl">
                Most systems track where things are. <span className="font-semibold text-slate-900">Vector</span> understands where they're going. 
              </p>
              <p className="text-base text-slate-500 leading-relaxed mb-8 max-w-lg italic border-l-2 border-slate-300 pl-4">
                "A vector is more than a point—it's movement with intent. We create straight lines between customer doorsteps and your warehouse."
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <Link href={user ? dashboardLink : "/signup"}>
                  <Button 
                    size="lg" 
                    className="gap-2 px-8 h-14 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 transition-all hover:shadow-2xl hover:-translate-y-0.5"
                  >
                    {user ? "Go to Dashboard" : "Start Free Trial"}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleSeed} 
                  disabled={seeding}
                  className="gap-2 px-8 h-14 text-base font-semibold border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <Play className="h-4 w-4" />
                  {seeding ? "Loading..." : "View Demo"}
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Setup in 5 minutes</span>
                </div>
              </div>
            </div>

            {/* Right - Product Visualization */}
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                      <MoveRight className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-slate-900">Vector Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-slate-500 font-medium">Live</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-100">
                    <div className="flex items-center gap-2 mb-2">
                      <RotateCcw className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Active</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">2,847</div>
                    <div className="text-xs text-slate-500 mt-1">Returns in progress</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">Rate</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">94.2%</div>
                    <div className="text-xs text-slate-500 mt-1">Approval rate</div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Score</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">4.9</div>
                    <div className="text-xs text-slate-500 mt-1">Trust rating</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-2xl p-4 border border-cyan-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-cyan-600" />
                      <span className="text-xs font-medium text-cyan-600 uppercase tracking-wide">Time</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">1.8h</div>
                    <div className="text-xs text-slate-500 mt-1">Avg. process time</div>
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className="px-6 pb-6">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Live Activity</span>
                      <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Real-time
                      </span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { action: "Return approved", item: "Nike Air Max - Size 9", time: "2m ago", status: "blue" },
                        { action: "QR code scanned", item: "Drop Box - Central Mall", time: "5m ago", status: "amber" },
                        { action: "Pickup scheduled", item: "Adidas Hoodie - Medium", time: "8m ago", status: "emerald" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`h-2 w-2 rounded-full ${item.status === 'blue' ? 'bg-blue-500' : item.status === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <div>
                              <div className="text-sm font-medium text-slate-900">{item.action}</div>
                              <div className="text-xs text-slate-500">{item.item}</div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="px-6 pb-6">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-600">Processing Efficiency</span>
                        <span className="font-semibold text-slate-900">92%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[92%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-slate-600">Customer Satisfaction</span>
                        <span className="font-semibold text-slate-900">98%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-[98%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl shadow-slate-900/10 p-4 border border-slate-100 animate-float-slow">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">AI Validated</div>
                    <div className="text-xs text-slate-500">Image verified</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl shadow-slate-900/10 p-4 border border-slate-100 animate-float-slower">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Out for Pickup</div>
                    <div className="text-xs text-slate-500">ETA: 15 mins</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center lg:text-left">
                <div className="text-4xl lg:text-5xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-900">{stat.label}</div>
                <div className="text-xs text-slate-500">{stat.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider mb-8">
            Trusted by leading fashion brands worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {trustedBrands.map((brand, index) => (
              <div key={index} className="text-xl font-bold text-slate-300 hover:text-slate-400 transition-colors">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 inline-flex rounded-full bg-slate-100 text-slate-700 border-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider">
              Platform Features
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Everything You Need to
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                Master Returns
              </span>
            </h2>
            <p className="text-lg text-slate-600">
              A complete ecosystem designed to transform returns from a cost center into a competitive advantage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group relative bg-slate-50 rounded-2xl p-8 border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-900/5 hover:border-slate-200 transition-all duration-500"
              >
                {/* Gradient hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${feature.lightColor} shadow-sm`}>
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 inline-flex rounded-full bg-white text-slate-700 border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider">
              Process Flow
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              How Vector Works
            </h2>
            <p className="text-lg text-slate-600">
              Four simple steps from return request to resolution
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl font-bold text-slate-100">{step.step}</span>
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                      <span className="text-white">{step.icon}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 inline-flex rounded-full bg-slate-100 text-slate-700 border-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider">
              Customer Stories
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
              Loved by Fashion Leaders
            </h2>
            <p className="text-lg text-slate-600">
              See how industry leaders are transforming their return operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="text-slate-700 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 font-semibold">
                    {testimonial.metric}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Transform Your Returns?
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Join 10,000+ fashion brands using Vector to turn returns into a competitive advantage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={user ? dashboardLink : "/signup"}>
              <Button 
                size="lg" 
                className="gap-2 px-8 h-14 text-base font-semibold bg-white text-slate-900 hover:bg-slate-100 shadow-xl transition-all"
              >
                {user ? "Go to Dashboard" : "Start Free Trial"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleSeed} 
              disabled={seeding}
              className="gap-2 px-8 h-14 text-base font-semibold border-slate-700 text-white hover:bg-slate-800 hover:text-white transition-all"
            >
              {seeding ? "Loading..." : "Explore Demo"}
            </Button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="flex items-center gap-2 mx-auto text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${showDemo ? "rotate-180" : ""}`} />
              {showDemo ? "Hide" : "Show"} demo credentials
            </button>
            
            {showDemo && (
              <div className="mt-4 inline-block rounded-xl bg-slate-800 p-4 text-sm text-slate-300 border border-slate-700">
                <div className="space-y-2 text-left">
                  <div>customer@vector.com / admin@vector.com</div>
                  <div>warehouse@vector.com / logistics@vector.com</div>
                  <div className="pt-2 border-t border-slate-700 font-semibold text-white">Password: password123</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <MoveRight className="h-6 w-6 text-slate-900" />
                </div>
                <span className="text-2xl font-bold text-white">Vector</span>
              </div>
              <p className="text-slate-400 max-w-sm leading-relaxed">
                The intelligent return management platform that transforms D2C returns into a competitive advantage for fashion brands.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2025 Vector. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
