'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { Chatbot } from '@/components/chatbot';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import React, { useEffect, useState } from 'react';
import { useUser, useFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const [userWithRole, setUserWithRole] = useState<AppUser | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    if (!isAuthUserLoading && !authUser) {
      router.push('/login');
    } else if (authUser && firestore) {
      const fetchUserRole = async () => {
        setIsRoleLoading(true);
        try {
          const userRef = doc(firestore, 'users', authUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            // Combine auth data with firestore data (which contains the role)
            const userData = {
                id: authUser.uid,
                email: authUser.email!,
                ...userDoc.data(),
            } as AppUser;
            setUserWithRole(userData);
          } else {
            // If no user document, they might be a new user. Fallback to authUser without a role.
            setUserWithRole({ id: authUser.uid, email: authUser.email! });
          }
        } catch (error) {
            console.error("Error fetching user role:", error);
            setUserWithRole({ id: authUser.uid, email: authUser.email! }); // Fallback on error
        } finally {
            setIsRoleLoading(false);
        }
      };
      fetchUserRole();
    }
  }, [authUser, isAuthUserLoading, firestore, router]);

  const isLoading = isAuthUserLoading || isRoleLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userWithRole) {
    // This case will be hit briefly during the redirect if not authenticated.
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AppSidebar user={userWithRole} />
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
      <Chatbot />
    </SidebarProvider>
  );
}
