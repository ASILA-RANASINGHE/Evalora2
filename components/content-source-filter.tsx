"use client";

import { useState } from "react";
import { Shield, GraduationCap, LayoutGrid } from "lucide-react";

type ContentSource = "all" | "evalora" | "teacher";

interface ContentSourceFilterProps {
  adminCount: number;
  teacherCount: number;
  adminSection: React.ReactNode;
  teacherSection: React.ReactNode;
  contentLabel?: string;
}

export function ContentSourceFilter({
  adminCount,
  teacherCount,
  adminSection,
  teacherSection,
  contentLabel = "content",
}: ContentSourceFilterProps) {
  const [source, setSource] = useState<ContentSource>("all");

  const tabs: { key: ContentSource; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "all", label: "All", icon: <LayoutGrid className="h-4 w-4" />, count: adminCount + teacherCount },
    { key: "evalora", label: "Evalora", icon: <Shield className="h-4 w-4" />, count: adminCount },
    { key: "teacher", label: "Teacher", icon: <GraduationCap className="h-4 w-4" />, count: teacherCount },
  ];

  const showAdmin = source === "all" || source === "evalora";
  const showTeacher = source === "all" || source === "teacher";
  const isEmpty = (source === "evalora" && adminCount === 0) || (source === "teacher" && teacherCount === 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSource(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              source === tab.key
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              source === tab.key ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No {source === "evalora" ? "Evalora" : "teacher"} {contentLabel} available yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {showAdmin && adminCount > 0 && (
            <div>
              {source === "all" && (
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-semibold text-blue-600">Evalora</h3>
                </div>
              )}
              <div className="grid gap-4">{adminSection}</div>
            </div>
          )}
          {showTeacher && teacherCount > 0 && (
            <div>
              {source === "all" && (
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-600">Teacher</h3>
                </div>
              )}
              <div className="grid gap-4">{teacherSection}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
