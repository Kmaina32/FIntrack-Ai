'use client';

import { useCollection, useFirebase, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc, getDoc } from "firebase/firestore";
import type { UserRole, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamTable } from "@/components/team/team-table";
import { DashboardHeader } from "@/components/dashboard-header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddMemberSheet } from "@/components/team/add-member-sheet";

export default function TeamPage() {
  const { firestore, user: authUser } = useFirebase();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (authUser && firestore) {
      const userRef = doc(firestore, 'users', authUser.uid);
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data() as User;
          setUser(userData);
          if (userData.role === 'Owner' || userData.role === 'Admin') {
            setIsAuthorized(true);
          } else {
            router.push('/dashboard');
          }
        } else {
            // If no user doc, they can't be an admin.
            router.push('/dashboard');
        }
      });
    } else if (!authUser) {
        // If not authenticated, redirect away.
        router.push('/login');
    }
  }, [authUser, firestore, router]);


  const teamQuery = useMemoFirebase(() => 
    isAuthorized && authUser ? query(
      collection(firestore, `users/${authUser.uid}/userRoles`),
      orderBy('email', 'asc')
    ) : null
  , [firestore, authUser, isAuthorized]);

  const { data: teamMembers, isLoading } = useCollection<UserRole>(teamQuery);

  // Render skeleton or nothing while checking authorization
  if (!isAuthorized) {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DashboardHeader title="Team Management" />
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Team Management">
         <AddMemberSheet />
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
