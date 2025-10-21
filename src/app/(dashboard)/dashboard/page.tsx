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
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

export default function DashboardPage() {
  const { firestore, user } = useFirebase();
  
  const transactionsQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/transactions`),
      orderBy('date', 'desc'),
      limit(100) // Fetch more transactions for calculations
    ) : null
  , [firestore, user]);

  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const [summaryCards, setSummaryCards] = useState<SummaryCardData[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (transactions) {
      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const thisMonthTransactions = transactions.filter(t => {
        const date = t.date instanceof Date ? t.date : new Date((t.date as any).seconds * 1000);
        return date >= thisMonthStart;
      });

      const lastMonthTransactions = transactions.filter(t => {
        const date = t.date instanceof Date ? t.date : new Date((t.date as any).seconds * 1000);
        return date >= lastMonthStart && date <= lastMonthEnd;
      });

      // This month's calculations
      const totalRevenue = thisMonthTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
      const totalExpenses = thisMonthTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
      
      // Last month's calculations
      const lastMonthRevenue = lastMonthTransactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
      const lastMonthExpenses = lastMonthTransactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);

      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const netIncome = totalRevenue + totalExpenses;

      setSummaryCards([
        { title: 'Total Revenue', value: totalRevenue, change: calculateChange(totalRevenue, lastMonthRevenue), period: 'from last month' },
        { title: 'Total Expenses', value: Math.abs(totalExpenses), change: calculateChange(Math.abs(totalExpenses), Math.abs(lastMonthExpenses)), period: 'from last month' },
        { title: 'Net Income', value: netIncome, change: calculateChange(netIncome, lastMonthRevenue + lastMonthExpenses), period: 'from last month' },
        { title: 'Cash Flow', value: netIncome, change: calculateChange(netIncome, lastMonthRevenue + lastMonthExpenses), period: 'from last month' },
      ]);

      setRecentTransactions(thisMonthTransactions.slice(0, 5));
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
        {transactionsLoading || summaryCards.length === 0 ? (
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
              {transactions && `You have ${recentTransactions.length} recent transactions.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? <Skeleton className="h-[300px]" /> : <RecentTransactions transactions={recentTransactions} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
