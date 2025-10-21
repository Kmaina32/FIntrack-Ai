
'use client';

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Invoice } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import Link from "next/link";

export default function InvoicesPage() {
  const { firestore, user } = useFirebase();

  const invoicesQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/invoices`),
      orderBy('issueDate', 'desc')
    ) : null
  , [firestore, user]);

  const { data: invoices, isLoading } = useCollection<Invoice>(invoicesQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Invoices">
        <Button asChild>
          <Link href="/invoices/create">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Invoice
          </Link>
        </Button>
      </DashboardHeader>
      {isLoading ? (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <InvoicesTable initialInvoices={invoices || []} />
      )}
    </div>
  );
}
