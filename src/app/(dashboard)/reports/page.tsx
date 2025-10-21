'use client';

import { useState } from "react";
import { ReportsTabs } from "@/components/reports/reports-tabs";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { Report } from "@/lib/types";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('income-statement');
  const [reportsData, setReportsData] = useState<Record<string, { title: string, description: string, data: {category: string, value: number}[] }>>({});

  const handleExport = (format: 'pdf' | 'excel') => {
    const report = reportsData[activeTab];
    if (!report) return;

    const reportTitle = report.title;
    const headers = ["Category", "Amount"];
    const body = report.data.map(d => [d.category, d.value]);

    if (format === 'pdf') {
      exportToPDF(reportTitle, headers, body);
    } else {
      exportToExcel(reportTitle, headers, body);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Reports
        </h1>
        <div className="flex items-center space-x-2">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ReportsTabs 
        onTabChange={setActiveTab} 
        onDataLoad={setReportsData}
      />
    </div>
  );
}
