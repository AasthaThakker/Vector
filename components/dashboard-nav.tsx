"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  RotateCcw,
  MapPin,
  BarChart3,
  Truck,
  Warehouse,
  Cog,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const roleLinks: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
  customer: [
    { href: "/customer/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/customer/orders", label: "Orders", icon: <Package className="h-4 w-4" /> },
    { href: "/customer/returns", label: "Returns", icon: <RotateCcw className="h-4 w-4" /> },
    { href: "/customer/track", label: "Track", icon: <MapPin className="h-4 w-4" /> },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/admin/returns", label: "Returns", icon: <RotateCcw className="h-4 w-4" /> },
    { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/automation/logs", label: "Automation", icon: <Cog className="h-4 w-4" /> },
  ],
  warehouse: [
    { href: "/warehouse/dashboard", label: "Dashboard", icon: <Warehouse className="h-4 w-4" /> },
  ],
  logistics: [
    { href: "/logistics/dashboard", label: "Dashboard", icon: <Truck className="h-4 w-4" /> },
  ],
};

export function DashboardNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const links = roleLinks[user.role] || [];

  return (
    <>
      {/* Desktop nav */}
      <nav className="glass-strong hidden md:flex fixed top-0 left-0 right-0 z-50 items-center justify-between px-6 py-3">
        <Link href={`/${user.role}/dashboard`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <RotateCcw className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">Vector</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <nav className="glass-strong md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3">
        <Link href={`/${user.role}/dashboard`} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <RotateCcw className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Vector</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="glass-strong md:hidden fixed top-14 left-0 right-0 z-40 p-4">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      <div className="h-16" />
    </>
  );
}
