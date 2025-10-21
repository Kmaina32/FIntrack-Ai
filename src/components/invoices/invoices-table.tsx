
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Invoice } from '@/lib/types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from 'lucide-react';
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

const PAGE_SIZE = 10;

export function InvoicesTable({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const [invoices, setInvoices] = React.useState(initialInvoices);
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);

  const totalPages = Math.ceil(invoices.length / PAGE_SIZE);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleDelete = async (invoiceId: string) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to delete an invoice.' });
        return;
    }
    try {
        await deleteDoc(doc(firestore, `users/${user.uid}/invoices`, invoiceId));
        toast({ title: 'Success', description: 'Invoice deleted successfully.' });
    } catch (error) {
        console.error("Error deleting invoice: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete invoice.' });
    }
  };
  
  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'Paid':
        return 'default';
      case 'Sent':
        return 'secondary';
      case 'Overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  }

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
            {paginatedInvoices.map(invoice => (
                <Card key={invoice.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium">{invoice.invoiceNumber}</CardTitle>
                        <span className="text-sm font-bold">{formatCurrency(invoice.totalAmount)}</span>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p className="text-muted-foreground">{invoice.customerName || 'N/A'}</p>
                        <p className="text-muted-foreground">Due: {formatDate(invoice.dueDate)}</p>
                        <div className="flex justify-between items-center">
                            <Badge variant={getStatusVariant(invoice.status)} className="capitalize truncate">
                                {invoice.status}
                            </Badge>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem disabled>View</DropdownMenuItem>
                                <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(invoice.id)}>Delete</DropdownMenuItem>
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
              <TableHead>Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.customerName || 'N/A'}</TableCell>
                <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(invoice.status)} className="capitalize truncate">
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(invoice.totalAmount)}</TableCell>
                <TableCell className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem disabled>View</DropdownMenuItem>
                        <DropdownMenuItem disabled>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(invoice.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
