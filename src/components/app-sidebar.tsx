'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  BookUser,
  Users,
  Store,
  Briefcase,
  Users2,
  ReceiptText,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { useUser } from '@/firebase';
import type { UserRole } from '@/lib/types';


const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/invoices',
    label: 'Invoices',
    icon: ReceiptText,
  },
  {
    href: '/transactions',
    label: 'Transactions',
    icon: ArrowLeftRight,
  },
  {
    href: '/accounts',
    label: 'Accounts',
    icon: BookUser,
  },
  {
    href: '/customers',
    label: 'Customers',
    icon: Users,
  },
  {
    href: '/vendors',
    label: 'Vendors',
    icon: Store,
  },
  {
    href: '/projects',
    label: 'Projects',
    icon: Briefcase,
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: BarChart3,
  },
];

const adminMenuItems = [
  {
    href: '/team',
    label: 'Team',
    icon: Users2,
  },
]

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const userRole = (user as any)?.role;

  const isAdmin = userRole === 'Owner' || userRole === 'Admin';


  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
           {isAdmin && adminMenuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {/* User profile menu has been moved to the main header */}
      </SidebarFooter>
    </>
  );
}
