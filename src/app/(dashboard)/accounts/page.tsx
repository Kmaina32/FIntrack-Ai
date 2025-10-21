'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Account } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountsTable } from "@/components/accounts/accounts-table";
import { AddAccountSheet } from "@/components/accounts/add-account-sheet";

export default function AccountsPage() {
  const { firestore, user } = useFirebase();

  const accountsQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/accounts`),
      orderBy('name', 'asc')
    ) : null
  , [firestore, user]);

  const { data: accounts, isLoading } = useCollection<Account>(accountsQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Chart of Accounts
        </h1>
        <div className="flex items-center space-x-2">
          <AddAccountSheet />
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
        <AccountsTable initialAccounts={accounts || []} />
      )}
    </div>
  );
}
    