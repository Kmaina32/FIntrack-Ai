'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { Chatbot } from '@/components/chatbot';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import React, { useEffect, useState } from 'react';
import { useUser, useFirebase, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
  const { firestore } = useFirebase();
  const router = useRouter();
  const [userWithRole, setUserWithRole] = useState<any>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    if (!isAuthUserLoading && !authUser) {
      router.push('/login');
    } else if (authUser && firestore) {
      const fetchUserRole = async () => {
        setIsRoleLoading(true);
        const userRef = doc(firestore, 'users', authUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserWithRole({ ...authUser, ...userDoc.data() });
        } else {
          setUserWithRole(authUser); // Fallback to auth user if no DB record
        }
        setIsRoleLoading(false);
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
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
      <Chatbot />
    </SidebarProvider>
  );
}
