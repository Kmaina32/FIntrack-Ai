'use client';

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useCollection, useFirebase, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc, getDoc } from "firebase/firestore";
import type { UserRole, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamTable } from "@/components/team/team-table";
import { DashboardHeader } from "@/components/dashboard-header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TeamPage() {
  const { firestore, user: authUser } = useFirebase();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (authUser && firestore) {
      const userRef = doc(firestore, 'users', authUser.uid);
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          setUser(userData);
          if (userData.role !== 'Owner' && userData.role !== 'Admin') {
            router.push('/dashboard');
          }
        }
      });
    }
  }, [authUser, firestore, router]);


  const teamQuery = useMemoFirebase(() => 
    authUser ? query(
      collection(firestore, `users/${authUser.uid}/userRoles`),
      orderBy('email', 'asc')
    ) : null
  , [firestore, authUser]);

  const { data: teamMembers, isLoading } = useCollection<UserRole>(teamQuery);

  if (!user) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Skeleton className="h-10 w-48" />
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Team Management">
         <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
          </Button>
      </DashboardHeader>
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
