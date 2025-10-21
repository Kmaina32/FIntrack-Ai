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
  Landmark,
  ChevronDown,
  GitCommitHorizontal,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import type { User } from '@/lib/types';
import { CollapsibleContent } from './ui/collapsible';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

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
        {
          href: '/bank-accounts',
          label: 'Bank Accounts',
          icon: Landmark,
        }
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
  const appVersion = process.env.npm_package_version || '0.1.0';

  const isAdmin = userRole === 'Owner' || userRole === 'Admin';


  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label} asChild>
                <>
                <SidebarGroupLabel>
                    {group.label}
                    <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                </SidebarGroupLabel>
                <CollapsibleContent asChild>
                    <div className="flex flex-col gap-1 py-1 pl-4">
                    {group.items.map((item) => (
                        <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                            tooltip={item.label}
                            variant="ghost"
                            className="h-8 justify-start"
                        >
                            <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    </div>
                </CollapsibleContent>
                </>
            </SidebarGroup>
          ))}
           {isAdmin && (
             <SidebarGroup>
                <SidebarGroupLabel>{adminMenu.label}</SidebarGroupLabel>
                 <CollapsibleContent asChild>
                    <div className="flex flex-col gap-1 py-1 pl-4">
                    {adminMenu.items.map((item) => (
                        <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith(item.href)}
                            tooltip={item.label}
                            variant="ghost"
                            className="h-8 justify-start"
                        >
                            <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    </div>
                 </CollapsibleContent>
            </SidebarGroup>
           )}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <Separator className="my-2 bg-sidebar-border" />
        <div className="p-2 text-sm text-sidebar-foreground/70 flex items-center gap-2">
            <GitCommitHorizontal className="h-4 w-4" />
            <span>Version: {appVersion}</span>
        </div>
      </SidebarFooter>
    </>
  );
}
