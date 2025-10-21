'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useEffect, useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';

type ReportData = {
  title: string,
  description: string,
  data: {category: string, value: number}[]
}

function ReportTable({ data, title, description }: { data: {category: string, value: number}[], title: string, description: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface ReportsTabsProps {
    onTabChange: (tab: string) => void;
    onDataLoad: (data: Record<string, ReportData>) => void;
}

export function ReportsTabs({ onTabChange, onDataLoad }: ReportsTabsProps) {
  const { firestore, user } = useFirebase();

  const transactionsQuery = useMemoFirebase(() =>
    user ? query(
      collection(firestore, `users/${user.uid}/transactions`),
      orderBy('date', 'desc')
    ) : null
  , [firestore, user]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  const reportsData = useMemo(() => {
    if (!transactions) {
      return {
        'income-statement': { title: 'Income Statement', description: 'A summary of financial performance.', data: [] },
        'balance-sheet': { title: 'Balance Sheet', description: 'A snapshot of your financial position.', data: [] },
        'cash-flow': { title: 'Cash Flow', description: 'A summary of cash movements.', data: [] },
      };
    }

    const totalRevenue = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
    const netIncome = totalRevenue + totalExpenses;
    
    const incomeStatement = {
        title: 'Income Statement',
        description: 'A summary of financial performance.',
        data: [
            { category: 'Total Revenue', value: totalRevenue },
            { category: 'Total Expenses', value: totalExpenses },
            { category: 'Net Income', value: netIncome },
        ]
    };

    const cashFlow = {
        title: 'Cash Flow Statement',
        description: 'A summary of cash movements.',
        data: [
            { category: 'Cash from Operations', value: netIncome },
            { category: 'Net Change in Cash', value: netIncome },
        ]
    };

     const balanceSheet = {
        title: 'Balance Sheet',
        description: 'A snapshot of your financial position.',
        data: [
            { category: 'Assets (Cash)', value: transactions.reduce((acc, t) => acc + t.amount, 0) },
            { category: 'Liabilities', value: 0 },
            { category: 'Equity', value: transactions.reduce((acc, t) => acc + t.amount, 0) },
        ]
    };

    return {
      'income-statement': incomeStatement,
      'balance-sheet': balanceSheet,
      'cash-flow': cashFlow
    };

  }, [transactions]);
  
  useEffect(() => {
    onDataLoad(reportsData);
  }, [reportsData, onDataLoad]);

  const reportSkeletons = <Skeleton className="h-[500px] w-full" />;

  return (
    <Tabs defaultValue="income-statement" className="space-y-4" onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
        <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
      </TabsList>
      <TabsContent value="income-statement">
        {isLoading ? reportSkeletons : <ReportTable {...reportsData['income-statement']} />}
      </TabsContent>
      <TabsContent value="balance-sheet">
         {isLoading ? reportSkeletons : <ReportTable {...reportsData['balance-sheet']} />}
      </TabsContent>
      <TabsContent value="cash-flow">
         {isLoading ? reportSkeletons : <ReportTable {...reportsData['cash-flow']} />}
      </TabsContent>
    </Tabs>
  );
}
