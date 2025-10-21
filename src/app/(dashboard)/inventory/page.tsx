
'use client';

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Product } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AddProductSheet } from "@/components/inventory/add-product-sheet";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { DashboardHeader } from "@/components/dashboard-header";

export default function InventoryPage() {
  const { firestore, user } = useFirebase();

  const productsQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/products`),
      orderBy('name', 'asc')
    ) : null
  , [firestore, user]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Inventory">
        <AddProductSheet />
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
        <InventoryTable initialProducts={products || []} />
      )}
    </div>
  );
}
