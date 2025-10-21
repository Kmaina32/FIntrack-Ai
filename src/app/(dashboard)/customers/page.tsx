'use client';

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Customer } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomersTable } from "@/components/customers/customers-table";
import { AddCustomerSheet } from "@/components/customers/add-customer-sheet";
import { DashboardHeader } from "@/components/dashboard-header";

export default function CustomersPage() {
  const { firestore, user } = useFirebase();

  const customersQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/customers`),
      orderBy('name', 'asc')
    ) : null
  , [firestore, user]);

  const { data: customers, isLoading } = useCollection<Customer>(customersQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Customers">
        <AddCustomerSheet />
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
        <CustomersTable initialCustomers={customers || []} />
      )}
    </div>
  );
}
