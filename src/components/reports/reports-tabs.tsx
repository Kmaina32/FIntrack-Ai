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
import { reports } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import type { Report } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

function ReportTable({ report }: { report: Report }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{report.title}</CardTitle>
        <CardDescription>
          A summary of financial performance for the selected period.
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
              {report.data.map((item) => (
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

export function ReportsTabs() {
  return (
    <Tabs defaultValue="income-statement" className="space-y-4">
      <TabsList>
        <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
        <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
      </TabsList>
      <TabsContent value="income-statement">
        <ReportTable report={reports.find(r => r.id === 'income-statement')!} />
      </TabsContent>
      <TabsContent value="balance-sheet">
        <ReportTable report={reports.find(r => r.id === 'balance-sheet')!} />
      </TabsContent>
      <TabsContent value="cash-flow">
        <ReportTable report={reports.find(r => r.id === 'cash-flow')!} />
      </TabsContent>
    </Tabs>
  );
}
