"use client";

import useSWR from "swr";
import { GlassCard } from "@/components/glass-card";
import { Cog, CheckCircle, XCircle, Clock, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AutomationLogs() {
  const { data, mutate } = useSWR("/api/automation/logs", fetcher);

  const logs = data?.logs || [];

  const statusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const stats = [
    {
      label: "Total Automations",
      value: logs.length,
      icon: <Zap className="h-5 w-5" />,
      color: "text-primary",
    },
    {
      label: "Successful",
      value: logs.filter((l: { status: string }) => l.status === "success").length,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "text-emerald-500",
    },
    {
      label: "Failed",
      value: logs.filter((l: { status: string }) => l.status === "failed").length,
      icon: <XCircle className="h-5 w-5" />,
      color: "text-red-500",
    },
    {
      label: "Pending",
      value: logs.filter((l: { status: string }) => l.status === "pending").length,
      icon: <Clock className="h-5 w-5" />,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Automation Logs</h1>
          <p className="text-muted-foreground">
            Monitor n8n workflows, AI analysis runs, and automated actions.
          </p>
        </div>
        <Button variant="outline" onClick={() => mutate()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <GlassCard key={stat.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className={stat.color}>{stat.icon}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <Cog className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Recent Logs</h2>
        </div>

        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No automation logs yet. Logs will appear when n8n workflows or AI analyses are triggered.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {logs.map(
              (log: {
                _id: string;
                workflowId: string;
                action: string;
                status: string;
                details?: string;
                timestamp: string;
              }) => (
                <div
                  key={log._id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-3",
                    log.status === "failed"
                      ? "bg-red-50 dark:bg-red-950/20"
                      : log.status === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/20"
                        : "bg-secondary/50"
                  )}
                >
                  <div className="mt-0.5">{statusIcon(log.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {log.action}
                      </p>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-mono text-muted-foreground">
                        {log.workflowId}
                      </span>
                    </div>
                    {log.details && (
                      <p className="mt-1 text-xs text-muted-foreground">{log.details}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
