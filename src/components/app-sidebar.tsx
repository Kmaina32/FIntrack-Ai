'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
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
  ShoppingCart,
  Boxes,
  Contact,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import type { User } from '@/lib/types';


const menuGroups = [
  {
    label: 'Overview',
    items: [
      {
        href: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        href: '/reports',
        label: 'Reports',
        icon: BarChart3,
      },
    ]
  },
  {
    label: 'Sales',
    items: [
      {
        href: '/pos',
        label: 'POS',
        icon: ShoppingCart,
      },
      {
        href: '/invoices',
        label: 'Invoices',
        icon: ReceiptText,
      },
      {
        href: '/customers',
        label: 'Customers',
        icon: Users,
      },
    ]
  },
  {
    label: 'Purchases',
    items: [
       {
        href: '/transactions',
        label: 'Transactions',
        icon: ArrowLeftRight,
      },
      {
        href: '/vendors',
        label: 'Vendors',
        icon: Store,
      },
    ]
  },
  {
      label: 'Management',
      items: [
         {
            href: '/inventory',
            label: 'Inventory',
            icon: Boxes,
        },
        {
            href: '/projects',
            label: 'Projects',
            icon: Briefcase,
        },
        {
            href: '/payroll',
            label: 'Payroll',
            icon: Contact,
        }
      ]
  },
  {
      label: 'Bookkeeping',
      items: [
        {
            href: '/accounts',
            label: 'Accounts',
            icon: BookUser,
        },
      ]
  }
];

const adminMenu = {
    label: 'Settings',
    items: [
      {
        href: '/team',
        label: 'Team',
        icon: Users2,
      },
    ]
}

export function AppSidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const userRole = user?.role;

  const isAdmin = userRole === 'Owner' || userRole === 'Admin';


  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroup>
          ))}
           {isAdmin && (
             <SidebarGroup>
                <SidebarGroupLabel>{adminMenu.label}</SidebarGroupLabel>
                {adminMenu.items.map((item) => (
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
            </SidebarGroup>
           )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        {/* User profile menu has been moved to the main header */}
      </SidebarFooter>
    </>
  );
}
