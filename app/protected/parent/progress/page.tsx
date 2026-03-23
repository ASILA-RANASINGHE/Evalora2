"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParentOverviewCards } from "./components/overview-cards";
import { ChildSummary } from "./components/child-summary";
import { SubjectGrid } from "./components/subject-grid";
import { WeeklyTimeline } from "./components/weekly-timeline";
import { StudyHabitsInsights } from "./components/study-habits";
import { RecentActivityFeed } from "./components/activity-feed";
import { WeakAreasPanel } from "./components/weak-areas-panel";
import { PeerComparison } from "./components/peer-comparison";
import { StudyTimeChart } from "./components/study-time-chart";
import { ProgressChart } from "./components/progress-chart";
import { childProgressData, defaultChildId } from "@/lib/parent-progress-mock-data";
import { TrendingUp, BookOpen, Activity, AlertTriangle } from "lucide-react";
import { DownloadParentProgressPDF } from "./components/download-pdf-button";

export default function ParentProgressPage() {
  const searchParams = useSearchParams();
  const childIdParam = searchParams.get("child");
  const childId = childIdParam ? parseInt(childIdParam) : defaultChildId;
  const d = childProgressData[childId] ?? childProgressData[defaultChildId];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-space-grotesk text-2xl font-bold">Learning Progress</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor {d.childInfo.name}&apos;s academic journey and study habits
          </p>
        </div>
        <DownloadParentProgressPDF data={d} />
      </div>

      {/* Child Summary — always visible */}
      <ChildSummary child={d.childInfo} />

      {/* Tabbed Sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Subjects</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
            {d.weakAreas.length > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {d.weakAreas.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ───────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <ParentOverviewCards stats={d.overviewStats} />
          <div className="grid gap-6 lg:grid-cols-2">
            <ProgressChart data={d.scoreHistory} />
            <StudyTimeChart data={d.studyTimeDistribution} />
          </div>
        </TabsContent>

        {/* ── Subjects Tab ────────────────────────────────────────────── */}
        <TabsContent value="subjects" className="space-y-6">
          <SubjectGrid subjects={d.subjectPerformance} />
          <PeerComparison data={d.peerComparison} />
        </TabsContent>

        {/* ── Activity Tab ────────────────────────────────────────────── */}
        <TabsContent value="activity" className="space-y-6">
          <WeeklyTimeline data={d.weeklyActivity} />
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentActivityFeed activities={d.recentActivity} />
            <StudyHabitsInsights insights={d.studyHabits} />
          </div>
        </TabsContent>

        {/* ── Alerts Tab ──────────────────────────────────────────────── */}
        <TabsContent value="alerts" className="space-y-6">
          <WeakAreasPanel areas={d.weakAreas} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
