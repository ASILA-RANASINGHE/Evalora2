"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OverviewCards } from "./components/overview-cards";
import { PerformanceChart } from "./components/performance-chart";
import { StudyHeatmap } from "./components/study-heatmap";
import { SubjectBreakdown } from "./components/subject-breakdown";
import { TopicMasteryTable } from "./components/topic-mastery-table";
import { QuestionTypeChart } from "./components/question-type-chart";
import { WeakAreaAnalysis } from "./components/weak-area-analysis";
import { ComparativeTable } from "./components/comparative-table";
import { TimeAnalyticsChart } from "./components/time-analytics-chart";
import { NotesEngagementTable } from "./components/notes-engagement-table";
import { PredictiveAlerts } from "./components/predictive-alerts";
import type { StudentProgressData } from "@/lib/actions/analytics";

export function ProgressDashboard({ data }: { data: StudentProgressData }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="subjects">Subjects</TabsTrigger>
        <TabsTrigger value="analysis">Analysis</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
      </TabsList>

      {/* Tab 1: Overview */}
      <TabsContent value="overview" className="space-y-6">
        <OverviewCards stats={data.overviewStats} />
        <PerformanceChart data={data.scoreHistory} subjects={data.chartSubjects} />
        <StudyHeatmap data={data.heatmapData} />
      </TabsContent>

      {/* Tab 2: Subjects */}
      <TabsContent value="subjects" className="space-y-6">
        <SubjectBreakdown data={data.subjectScores} />
        <TopicMasteryTable data={data.topicMastery} />
      </TabsContent>

      {/* Tab 3: Analysis */}
      <TabsContent value="analysis" className="space-y-6">
        <QuestionTypeChart data={data.questionTypeStats} />
        <WeakAreaAnalysis data={data.weakAreas} />
        <ComparativeTable data={data.comparativeData} />
      </TabsContent>

      {/* Tab 4: Activity */}
      <TabsContent value="activity" className="space-y-6">
        <TimeAnalyticsChart data={data.timePerformance} />
        <NotesEngagementTable data={data.notesEngagement} />
      </TabsContent>

      {/* Tab 5: Alerts */}
      <TabsContent value="alerts" className="space-y-6">
        <PredictiveAlerts alerts={data.riskAlerts} />
      </TabsContent>
    </Tabs>
  );
}
