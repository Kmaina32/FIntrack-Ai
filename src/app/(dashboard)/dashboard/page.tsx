'use client';
import { SummaryCard } from "@/components/dashboard/summary-card";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, where, limit, orderBy } from "firebase/firestore";
import type { Transaction, SummaryCardData } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { firestore, user } = useFirebase();
  
  const transactionsQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/transactions`),
      orderBy('date', 'desc'),
      limit(20)
    ) : null
  , [firestore, user]);

  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const [summaryCards, setSummaryCards] = useState<SummaryCardData[]>([
    { title: 'Total Revenue', value: 0, change: 0, period: 'from last month' },
    { title: 'Total Expenses', value: 0, change: 0, period: 'from last month' },
    { title: 'Net Income', value: 0, change: 0, period: 'from last month' },
    { title: 'Cash Flow', value: 0, change: 0, period: 'from last month' },
  ]);

  useEffect(() => {
    if (transactions) {
      const totalRevenue = transactions.filter(t => t.type === 'Income').reduce((acc, t) => acc + t.amount, 0);
      const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((acc, t) => acc + t.amount, 0);
      const netIncome = totalRevenue - totalExpenses;
      
      setSummaryCards([
        { title: 'Total Revenue', value: totalRevenue, change: 0, period: 'this month' },
        { title: 'Total Expenses', value: totalExpenses, change: 0, period: 'this month' },
        { title: 'Net Income', value: netIncome, change: 0, period: 'this month' },
        { title: 'Cash Flow', value: netIncome, change: 0, period: 'this month' },
      ]);
    }
  }, [transactions]);


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Dashboard
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {transactionsLoading ? (
          <>
            <Skeleton className="h-[126px]" />
            <Skeleton className="h-[126px]" />
            <Skeleton className="h-[126px]" />
            <Skeleton className="h-[126px]" />
          </>
        ) : (
          summaryCards.map((card) => (
            <SummaryCard key={card.title} {...card} />
          ))
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             {transactionsLoading ? <Skeleton className="h-[350px]" /> : <OverviewChart transactions={transactions || []} />}
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Recent Transactions</CardTitle>
            <CardDescription>
              {transactions && `You made ${transactions.length} transactions this month.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? <Skeleton className="h-[300px]" /> : <RecentTransactions transactions={transactions?.slice(0, 5) || []} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
