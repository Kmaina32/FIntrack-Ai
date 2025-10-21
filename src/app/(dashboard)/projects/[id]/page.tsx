
'use client';

import { useCollection, useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, doc, query, where } from "firebase/firestore";
import type { Project, Transaction } from "@/lib/types";
import { useParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { useMemo } from "react";

export default function ProjectDetailPage() {
  const { firestore, user } = useFirebase();
  const params = useParams();
  const projectId = params.id as string;

  const projectRef = useMemoFirebase(() => 
    user && projectId ? doc(firestore, `users/${user.uid}/projects`, projectId) : null
  , [firestore, user, projectId]);
  const { data: project, isLoading: projectLoading } = useDoc<Project>(projectRef);

  const transactionsQuery = useMemoFirebase(() => 
    user && projectId ? query(
      collection(firestore, `users/${user.uid}/transactions`),
      where('projectId', '==', projectId)
    ) : null
  , [firestore, user, projectId]);
  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const projectMetrics = useMemo(() => {
    if (!transactions) return { revenue: 0, expenses: 0, profit: 0, remainingBudget: 0 };
    const revenue = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
    const profit = revenue - expenses;
    const remainingBudget = project?.budget ? project.budget - expenses : 0;
    return { revenue, expenses, profit, remainingBudget };
  }, [transactions, project]);


  if (projectLoading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-[126px]" />
                <Skeleton className="h-[126px]" />
                <Skeleton className="h-[126px]" />
                <Skeleton className="h-[126px]" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    )
  }

  if (!project) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DashboardHeader title="Project Not Found" />
            <p>The project you are looking for does not exist.</p>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title={project.name} />
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Revenue" value={projectMetrics.revenue} />
        <SummaryCard title="Actual Costs" value={projectMetrics.expenses} />
        <SummaryCard title="Net Profit" value={projectMetrics.profit} />
         {project.budget && <SummaryCard title="Budget Remaining" value={projectMetrics.remainingBudget} /> }
      </div>
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Project Transactions</CardTitle>
        </CardHeader>
        <CardContent>
            {transactionsLoading ? (
                 <Skeleton className="h-64 w-full" />
            ): (
                <TransactionsTable initialTransactions={transactions || []} />
            )}
        </CardContent>
      </Card>
    </div>
  );
}

