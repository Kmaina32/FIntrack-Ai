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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetchRole = async () => {
      if (authUser && firestore) {
        try {
          const userRef = doc(firestore, 'users', authUser.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = { id: docSnap.id, ...docSnap.data() } as User;
            setCurrentUser(userData);
            if (userData.role === 'Owner' || userData.role === 'Admin') {
              setIsAuthorized(true);
            } else {
              router.push('/dashboard');
            }
          } else {
              // If no user doc, they can't be an admin.
              router.push('/dashboard');
          }
        } catch (error) {
            console.error("Error checking authorization:", error);
            router.push('/dashboard');
        } finally {
            setIsLoading(false);
        }
      } else if (!authUser) {
          // If not authenticated, redirect away.
          router.push('/login');
      }
    };
    checkAuthAndFetchRole();
  }, [authUser, firestore, router]);


  const teamQuery = useMemoFirebase(() => 
    isAuthorized && authUser ? query(
      collection(firestore, `users/${authUser.uid}/userRoles`),
      orderBy('email', 'asc')
    ) : null
  , [firestore, authUser, isAuthorized]);

  const { data: teamMembers, isLoading: isLoadingTeam } = useCollection<UserRole>(teamQuery);
  const currentUserRole = currentUser?.role;

  // Render skeleton or nothing while checking authorization
  if (isLoading) {
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

  if (!isAuthorized) {
    // This is a fallback in case the redirect hasn't happened yet.
    return null; 
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Team Management">
         <AddMemberSheet />
      </DashboardHeader>
      {isLoadingTeam ? (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <TeamTable initialMembers={teamMembers || []} currentUserRole={currentUserRole}/>
      )}
    </div>
  );
}
