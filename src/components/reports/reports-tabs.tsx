
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
  TableFooter
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import type { Transaction, Sale } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { startOfDay, endOfDay } from 'date-fns';

type ReportData = {
  title: string,
  description: string,
  data: {category: string, value: number}[]
}

function ReportTable({ data, title, description, totalLabel = "Total" }: { data: {category: string, value: number}[], title: string, description: string, totalLabel?: string }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
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
            <TableFooter>
                <TableRow>
                    <TableCell className="font-bold">{totalLabel}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(total)}</TableCell>
                </TableRow>
            </TableFooter>
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
  const [sessionSales, setSessionSales] = useState<Sale[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);

  const transactionsQuery = useMemoFirebase(() =>
    user ? query(
      collection(firestore, `users/${user.uid}/transactions`),
      orderBy('date', 'desc')
    ) : null
  , [firestore, user]);
  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const today = new Date();
  
  const dailySalesQuery = useMemoFirebase(() => {
    if (!user) return null;
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    return query(
        collection(firestore, `users/${user.uid}/sales`),
        where('date', '>=', Timestamp.fromDate(startOfToday)),
        where('date', '<=', Timestamp.fromDate(endOfToday))
    )
  }, [firestore, user]);
  
  const { data: dailySales, isLoading: dailySalesLoading } = useCollection<Sale>(dailySalesQuery);
  
  const salesQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, `users/${user.uid}/sales`), orderBy('date', 'desc')) : null, [firestore, user]
  );
  
  const { data: allSales } = useCollection<Sale>(salesQuery);

  useEffect(() => {
    if (initialLoad && allSales) {
        setSessionSales(allSales || []);
        setInitialLoad(false);
    }
  }, [allSales, initialLoad]);


  const reportsData = useMemo(() => {
    if (!transactions) {
      return {
        'income-statement': { title: 'Income Statement', description: 'A summary of financial performance.', data: [] },
        'balance-sheet': { title: 'Balance Sheet', description: 'A snapshot of your financial position.', data: [] },
        'cash-flow': { title: 'Cash Flow', description: 'A summary of cash movements.', data: [] },
        'z-report': { title: 'Z Report (Daily Sales)', description: 'Summary of all sales for today.', data: [] },
        'x-report': { title: 'X Report (Session Sales)', description: 'Summary of sales since this session started.', data: [] },
      };
    }

    const totalRevenue = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);
    const netIncome = totalRevenue + totalExpenses;
    
    const incomeStatement = {
        title: 'Income Statement',
        description: 'A summary of revenues, expenses, and profits.',
        data: [
            { category: 'Total Revenue', value: totalRevenue },
            { category: 'Total Expenses', value: totalExpenses },
        ]
    };

    const cashFlow = {
        title: 'Cash Flow Statement',
        description: 'A summary of cash moving in and out of your business.',
        data: [
            { category: 'Cash from Operating Activities', value: netIncome },
        ]
    };

     const balanceSheet = {
        title: 'Balance Sheet',
        description: 'A snapshot of your financial position at a single point in time.',
        data: [
            { category: 'Assets (Cash)', value: transactions.reduce((acc, t) => acc + t.amount, 0) },
            { category: 'Liabilities', value: 0 }, 
        ]
    };

    const zReport = {
        title: 'Z Report (Daily Sales)',
        description: `Summary of all sales for ${today.toLocaleDateString()}`,
        data: dailySales ? [
            { category: 'Total Sales', value: dailySales.reduce((sum, sale) => sum + sale.total, 0) },
            { category: 'Total Tax', value: dailySales.reduce((sum, sale) => sum + sale.tax, 0) },
        ] : []
    };

    const xReport = {
        title: 'X Report (Session Sales)',
        description: 'Summary of sales since this app session started.',
        data: sessionSales ? [
            { category: 'Total Sales', value: sessionSales.reduce((sum, sale) => sum + sale.total, 0) },
            { category: 'Total Tax', value: sessionSales.reduce((sum, sale) => sum + sale.tax, 0) },
        ] : []
    };

    return {
      'income-statement': incomeStatement,
      'balance-sheet': balanceSheet,
      'cash-flow': cashFlow,
      'z-report': zReport,
      'x-report': xReport,
    };

  }, [transactions, dailySales, sessionSales, today]);
  
  useEffect(() => {
    onDataLoad(reportsData);
  }, [reportsData, onDataLoad]);

  const isLoading = transactionsLoading || dailySalesLoading;
  const reportSkeletons = <Skeleton className="h-[500px] w-full" />;

  const incomeStatementTotal = reportsData['income-statement'].data.reduce((acc, item) => acc + item.value, 0);
  const balanceSheetTotal = reportsData['balance-sheet'].data.reduce((acc, item) => item.category === 'Liabilities' ? acc - item.value : acc + item.value, 0);


  return (
    <Tabs defaultValue="income-statement" className="space-y-4" onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 w-full h-auto">
        <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
        <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
        <TabsTrigger value="z-report">Z Report</TabsTrigger>
        <TabsTrigger value="x-report">X Report</TabsTrigger>
      </TabsList>
      <TabsContent value="income-statement">
        {isLoading ? reportSkeletons : (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{reportsData['income-statement'].title}</CardTitle>
                    <CardDescription>{reportsData['income-statement'].description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportsData['income-statement'].data.map((item) => (
                            <TableRow key={item.category}>
                                <TableCell className="font-medium">{item.category}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell className="font-bold">Net Income</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(incomeStatementTotal)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        )}
      </TabsContent>
      <TabsContent value="balance-sheet">
         {isLoading ? reportSkeletons : (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">{reportsData['balance-sheet'].title}</CardTitle>
                    <CardDescription>{reportsData['balance-sheet'].description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportsData['balance-sheet'].data.map((item) => (
                            <TableRow key={item.category}>
                                <TableCell className="font-medium">{item.category}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell className="font-bold">Total Equity</TableCell>
                                <TableCell className="text-right font-bold">{formatCurrency(balanceSheetTotal)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
         )}
      </TabsContent>
      <TabsContent value="cash-flow">
         {isLoading ? reportSkeletons : <ReportTable {...reportsData['cash-flow']} totalLabel="Net Change in Cash"/>}
      </TabsContent>
       <TabsContent value="z-report">
         {isLoading ? reportSkeletons : <ReportTable {...reportsData['z-report']} totalLabel="Total Collection"/>}
      </TabsContent>
       <TabsContent value="x-report">
         {isLoading ? reportSkeletons : <ReportTable {...reportsData['x-report']} totalLabel="Total Collection"/>}
      </TabsContent>
    </Tabs>
  );
}
