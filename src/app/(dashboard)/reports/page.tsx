import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ReportsTabs } from "@/components/reports/reports-tabs";

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Reports
        </h1>
        <div className="flex items-center space-x-2">
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>
      <ReportsTabs />
    </div>
  );
}
