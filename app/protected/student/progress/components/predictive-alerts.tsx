"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import type { RiskAlert } from "@/lib/student-progress-mock-data";

const ALERT_CONFIG = {
  critical: {
    icon: AlertTriangle,
    border: "border-l-4 border-l-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    iconColor: "text-red-500",
    titleColor: "text-red-700 dark:text-red-400",
    buttonClass: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    icon: AlertCircle,
    border: "border-l-4 border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    iconColor: "text-amber-500",
    titleColor: "text-amber-700 dark:text-amber-400",
    buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  "on-track": {
    icon: CheckCircle2,
    border: "border-l-4 border-l-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    iconColor: "text-emerald-500",
    titleColor: "text-emerald-700 dark:text-emerald-400",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
};

export function PredictiveAlerts({ alerts }: { alerts: RiskAlert[] }) {
  const critical = alerts.filter((a) => a.level === "critical");
  const warning = alerts.filter((a) => a.level === "warning");
  const onTrack = alerts.filter((a) => a.level === "on-track");

  const groups = [
    { label: "Critical", description: "Needs immediate attention", items: critical, level: "critical" as const },
    { label: "Warning", description: "Monitor closely", items: warning, level: "warning" as const },
    { label: "On Track", description: "Performing well", items: onTrack, level: "on-track" as const },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-[#B7BDF7]/40 bg-gradient-to-br from-[#FFFDF1] to-[#B7BDF7]/10 dark:from-[#4D2FB2]/10 dark:to-[#696FC7]/5">
        <CardHeader>
          <CardTitle className="text-lg">Risk Alert System</CardTitle>
          <CardDescription>AI-powered predictions based on your performance patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {groups.map((group) => {
            if (group.items.length === 0) return null;
            const config = ALERT_CONFIG[group.level];
            return (
              <div key={group.level}>
                <h3 className={`text-sm font-semibold mb-3 ${config.titleColor}`}>
                  {group.label} — {group.description}
                </h3>
                <div className="space-y-3">
                  {group.items.map((alert, i) => {
                    const Icon = config.icon;
                    return (
                      <div
                        key={i}
                        className={`rounded-lg p-4 ${config.border} ${config.bg}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                            <div>
                              <h4 className="font-semibold text-sm">{alert.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{alert.reason}</p>
                            </div>
                          </div>
                          <Button size="sm" className={`text-xs flex-shrink-0 ${config.buttonClass}`}>
                            {alert.action}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
