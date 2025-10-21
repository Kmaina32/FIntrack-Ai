'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { UserRole } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamTable } from "@/components/team/team-table";

export default function TeamPage() {
  const { firestore, user } = useFirebase();

  const teamQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/userRoles`),
      orderBy('email', 'asc')
    ) : null
  , [firestore, user]);

  const { data: teamMembers, isLoading } = useCollection<UserRole>(teamQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Team Management
        </h1>
        <div className="flex items-center space-x-2">
           <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <TeamTable initialMembers={teamMembers || []} />
      )}
    </div>
  );
}
