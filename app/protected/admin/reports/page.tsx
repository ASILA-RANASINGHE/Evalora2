import { getAdminReportData } from "@/lib/actions/admin";
import { ReportsClient } from "./reports-client";

export default async function ReportsPage() {
  const data = await getAdminReportData();
  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Failed to load report data.</p>
      </div>
    );
  }
  return <ReportsClient data={data} />;
}
