
'use client';

import { useDoc, useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Invoice } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function InvoiceDetailPage() {
  const { firestore, user } = useFirebase();
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const invoiceRef = useMemoFirebase(() => 
    user && invoiceId ? doc(firestore, `users/${user.uid}/invoices`, invoiceId) : null
  , [firestore, user, invoiceId]);
  const { data: invoice, isLoading: invoiceLoading } = useDoc<Invoice>(invoiceRef);

  const getStatusVariant = (status?: string) => {
    switch(status) {
      case 'Paid': return 'default';
      case 'Sent': return 'secondary';
      case 'Overdue': return 'destructive';
      default: return 'outline';
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = date.toDate ? date.toDate() : new Date(date);
    return format(d, 'PPP');
  }

  const handlePrint = () => {
    window.print();
  }

  if (invoiceLoading) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DashboardHeader title="Loading Invoice..." />
            <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    )
  }

  if (!invoice) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DashboardHeader title="Invoice Not Found" />
            <p>The invoice you are looking for does not exist.</p>
        </div>
    )
  }

  const subtotal = invoice.lineItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxes = 0; // Placeholder
  const total = subtotal + taxes;


  return (
    <>
    <style jsx global>{`
        @media print {
            body > :not(#invoice-printable) {
                display: none;
            }
            #invoice-printable {
                display: block;
                margin: 0;
                padding: 0;
            }
            .no-print {
                display: none;
            }
        }
    `}</style>
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <DashboardHeader title={`Invoice ${invoice.invoiceNumber}`}>
            <Button onClick={handlePrint} className="no-print">
                <Printer className="mr-2 h-4 w-4" />
                Print or Save PDF
            </Button>
        </DashboardHeader>
        
        <div id="invoice-printable">
            <Card className="w-full max-w-4xl mx-auto shadow-none border-0 md:border md:shadow-sm">
                <CardHeader className="px-6 md:px-8 pt-6 md:pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold font-headline text-primary">INVOICE</h1>
                            <p className="text-muted-foreground">{invoice.invoiceNumber}</p>
                        </div>
                        <div className="text-left md:text-right mt-4 md:mt-0">
                             <div className="font-bold text-lg">FinTrack AI</div>
                             <div className="text-muted-foreground text-sm">
                                123 Main Street<br/>
                                Anytown, USA 12345
                             </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-sm">
                        <div>
                            <div className="font-semibold text-muted-foreground">Billed To</div>
                            <div>{invoice.customerName}</div>
                        </div>
                        <div>
                            <div className="font-semibold text-muted-foreground">Issue Date</div>
                            <div>{formatDate(invoice.issueDate)}</div>
                        </div>
                         <div>
                            <div className="font-semibold text-muted-foreground">Due Date</div>
                            <div>{formatDate(invoice.dueDate)}</div>
                        </div>
                        <div>
                            <div className="font-semibold text-muted-foreground">Status</div>
                            <Badge variant={getStatusVariant(invoice.status)} className="capitalize text-xs">{invoice.status}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 md:px-8">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60%]">Description</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Unit Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {invoice.lineItems.map((item, index) => (
                            <TableRow key={index}>
                            <TableCell className="font-medium">{item.description}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="px-6 md:px-8 pb-6 md:pb-8">
                    <div className="w-full flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                             <div className="flex justify-between border-t pt-2">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Taxes (0%)</span>
                                <span>{formatCurrency(taxes)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    </div>
    </>
  );
}

