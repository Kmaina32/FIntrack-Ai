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
import type { Report } from '@/lib/types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { deleteDoc, doc } from 'firebase/firestore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { exportToPDF } from '@/lib/export';

const PAGE_SIZE = 10;

export function ReportsHistoryTable({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = React.useState(initialReports);
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  const totalPages = Math.ceil(reports.length / PAGE_SIZE);
  const paginatedReports = reports.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDelete = async (reportId: string) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to delete a report.' });
        return;
    }
    try {
        await deleteDoc(doc(firestore, `users/${user.uid}/reports`, reportId));
        toast({ title: 'Success', description: 'Report deleted successfully.' });
    } catch (error) {
        console.error("Error deleting report: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete report.' });
    }
  };

  const handleDownload = (report: Report) => {
    const title = `${report.type} Report - ${formatDate(report.generatedAt)}`;
    const headers = ["Metric", "Value"];
    const body = [
        ["Total Sales", formatCurrency(report.data.totalSales)],
        ["Total Tax", formatCurrency(report.data.totalTax)],
        ["Number of Transactions", report.data.totalTransactions],
    ];
    exportToPDF(title, headers, body);
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return format(d, 'dd MMM, yyyy HH:mm');
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
            {paginatedReports.map(report => (
                <Card key={report.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium">{report.type} Report</CardTitle>
                         <span className="font-bold">{formatCurrency(report.data.totalSales)}</span>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p className="text-muted-foreground">{formatDate(report.generatedAt)}</p>
                        <p className="text-muted-foreground">{report.data.totalTransactions} transactions</p>
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleDownload(report)}>Download PDF</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(report.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
              <TableHead>Generated At</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{formatDate(report.generatedAt)}</TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>{formatCurrency(report.data.totalSales)}</TableCell>
                <TableCell>{report.data.totalTransactions}</TableCell>
                <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                        <Download className="mr-2 h-3 w-3" />
                        Download
                    </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {renderPagination()}
    </>
  );
}

    