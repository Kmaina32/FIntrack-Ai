'use client';

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Account } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AccountsTable } from "@/components/accounts/accounts-table";
import { AddAccountSheet } from "@/components/accounts/add-account-sheet";
import { DashboardHeader } from "@/components/dashboard-header";

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
      <DashboardHeader title="Chart of Accounts">
        <AddAccountSheet />
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
        <AccountsTable initialAccounts={accounts || []} />
      )}
    </div>
  );
}
