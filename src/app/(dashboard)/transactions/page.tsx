'use client';

import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Upload } from "lucide-react";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";
import { ImportReceiptSheet } from "@/components/transactions/import-receipt-sheet";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Transaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Transactions
        </h1>
        <div className="flex items-center space-x-2">
          <ImportReceiptSheet />
          <AddTransactionSheet />
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
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
