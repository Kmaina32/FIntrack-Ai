
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { PayrollRun } from '@/lib/types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

const PAGE_SIZE = 10;

export function PayrollHistoryTable({ initialPayrollRuns }: { initialPayrollRuns: PayrollRun[] }) {
  const [payrollRuns, setPayrollRuns] = React.useState(initialPayrollRuns);
  const [currentPage, setCurrentPage] = React.useState(1);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setPayrollRuns(initialPayrollRuns);
  }, [initialPayrollRuns]);

  const totalPages = Math.ceil(payrollRuns.length / PAGE_SIZE);
  const paginatedPayrollRuns = payrollRuns.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return format(d, 'dd MMM, yyyy');
  }

  const renderPagination = () => (
     <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>
  );

  if (isMobile) {
    return (
        <div className="space-y-4">
            {paginatedPayrollRuns.map(run => (
                <Card key={run.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium">Payroll: {formatDate(run.runDate)}</CardTitle>
                        <span className="font-bold">{formatCurrency(run.totalAmount)}</span>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p className="text-muted-foreground">{run.employeeCount} employees paid</p>
                    </CardContent>
                </Card>
            ))}
            {renderPagination()}
        </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run Date</TableHead>
              <TableHead>Employees Paid</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPayrollRuns.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="font-medium">{formatDate(run.runDate)}</TableCell>
                <TableCell>{run.employeeCount}</TableCell>
                <TableCell className="text-right">{formatCurrency(run.totalAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {renderPagination()}
    </>
  );
}
