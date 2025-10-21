'use client';

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Vendor } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { VendorsTable } from "@/components/vendors/vendors-table";
import { AddVendorSheet } from "@/components/vendors/add-vendor-sheet";

export default function VendorsPage() {
  const { firestore, user } = useFirebase();

  const vendorsQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/vendors`),
      orderBy('name', 'asc')
    ) : null
  , [firestore, user]);

  const { data: vendors, isLoading } = useCollection<Vendor>(vendorsQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Vendors
        </h1>
        <div className="flex items-center space-x-2">
          <AddVendorSheet />
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
        <VendorsTable initialVendors={vendors || []} />
      )}
    </div>
  );
}
    
