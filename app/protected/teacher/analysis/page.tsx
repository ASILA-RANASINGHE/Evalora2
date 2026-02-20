"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { students, teacherAnalytics } from "@/lib/teacher-mock-data";

import { OverviewCards } from "./components/overview-cards";
import { StudentList } from "./components/student-list";
import { TopPerformers } from "./components/top-performers";
import { AttentionNeeded } from "./components/attention-needed";
import { ClassDistribution } from "./components/class-distribution";
import { SubjectComparison } from "./components/subject-comparison";
import { WeeklyActivity } from "./components/weekly-activity";
import { TopicDifficulty } from "./components/topic-difficulty";
import { StudyTimePanel } from "./components/study-time-panel";
import { StudentDeepDive } from "./components/student-deep-dive";

export default function AnalysisPage() {
  const [view, setView] = useState<"overview" | "student">("overview");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const atRiskStudents = students.filter((s) => s.status === "At Risk" || s.status === "Inactive");

  function handleViewDetails(id: number) {
    setSelectedStudentId(id);
    setView("student");
  }

  function handleBack() {
    setView("overview");
    setSelectedStudentId(null);
  }

  if (view === "student" && selectedStudentId !== null) {
    const student = students.find((s) => s.id === selectedStudentId);
    if (student) {
      return (
        <div className="space-y-6">
          <StudentDeepDive student={student} onBack={handleBack} />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="font-space-grotesk text-2xl font-bold">Student Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Class overview, performance trends, and individual student insights
        </p>
      </div>

      {/* Overview stat cards */}
      <OverviewCards stats={teacherAnalytics.overviewStats} />

      {/* Main tabbed content */}
      <Tabs defaultValue="students">
        <TabsList className="mb-4">
          <TabsTrigger value="students">My Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* ── My Students tab ── */}
        <TabsContent value="students" className="space-y-0 mt-0">
          <StudentList students={students} onViewDetails={handleViewDetails} />
        </TabsContent>

        {/* ── Analytics tab ── */}
        <TabsContent value="analytics" className="space-y-6 mt-0">
          {/* Row 1: Top Performers + Attention Needed */}
          <div className="grid gap-6 lg:grid-cols-2">
            <TopPerformers performers={teacherAnalytics.topPerformers} />
            <AttentionNeeded students={atRiskStudents} />
          </div>

          {/* Row 2: Score Distribution + Subject Comparison */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ClassDistribution data={teacherAnalytics.scoreDistribution} />
            <SubjectComparison data={teacherAnalytics.subjectPerformance} />
          </div>

          {/* Row 3: Weekly Activity (full width) */}
          <WeeklyActivity data={teacherAnalytics.weeklyActivity} />

          {/* Row 4: Topic Difficulty + Study Time */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TopicDifficulty topics={teacherAnalytics.topicDifficulty} students={students} />
            </div>
            <StudyTimePanel stats={teacherAnalytics.studyTimeStats} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
