import { AppSidebar } from '@/components/app-sidebar';
import { Chatbot } from '@/components/chatbot';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
      <Chatbot />
    </SidebarProvider>
  );
}
