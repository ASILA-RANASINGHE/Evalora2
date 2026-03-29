import { getParentDashboardData } from "@/lib/actions/analytics";
import { ParentDashboardClient } from "./components/parent-dashboard-client";

export default async function ParentDashboard() {
  const data = await getParentDashboardData();

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-space-grotesk text-2xl font-bold">Parent Dashboard</h2>
          <p className="text-muted-foreground mt-1">Unable to load dashboard data. Please sign in again.</p>
        </div>
      </div>
    );
  }

  if (data.children.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-space-grotesk text-2xl font-bold">Good morning, {data.parentName}</h2>
          <p className="text-muted-foreground mt-1">
            No linked students found. Please contact your school to link your children to your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ParentDashboardClient
      parentName={data.parentName}
      children={data.children}
      upcomingMilestones={data.upcomingMilestones}
    />
  );
}
