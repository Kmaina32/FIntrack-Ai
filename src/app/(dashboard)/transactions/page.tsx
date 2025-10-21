'use client';

import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";
import { ImportReceiptSheet } from "@/components/transactions/import-receipt-sheet";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Transaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard-header";

export default function TransactionsPage() {
  const { firestore, user } = useFirebase();

  const transactionsQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/transactions`),
      orderBy('date', 'desc')
    ) : null
  , [firestore, user]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Transactions">
        <Button variant="outline" disabled>
            <Upload className="mr-2 h-4 w-4" /> Import Statement
        </Button>
        <ImportReceiptSheet />
        <AddTransactionSheet />
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
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
        <TransactionsTable initialTransactions={transactions || []} />
      )}
    </div>
  );
}
