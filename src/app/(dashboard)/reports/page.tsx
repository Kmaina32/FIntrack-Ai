'use client';

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Report } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportsHistoryTable } from "@/components/reports/reports-history-table";
import { DashboardHeader } from "@/components/dashboard-header";

export default function ReportsPage() {
  const { firestore, user } = useFirebase();

  const reportsQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/reports`),
      orderBy('generatedAt', 'desc')
    ) : null
  , [firestore, user]);

  const { data: reports, isLoading } = useCollection<Report>(reportsQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Report History" />
      {isLoading ? (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <ReportsHistoryTable initialReports={reports || []} />
      )}
    </div>
  );
}

    