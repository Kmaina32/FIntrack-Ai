'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  LogOut,
  BookUser,
  Users,
  Store,
  Briefcase,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { useAuth, useUser } from '@/firebase';
import { Button } from './ui/button';
import { signOut } from 'firebase/auth';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
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
    icon: Briefcase
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Logo />
          <SidebarTrigger />
        </div>
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
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center justify-between p-2 rounded-md bg-sidebar-accent">
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'user'} data-ai-hint="person portrait" />}
              <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm truncate">
              <span className="font-semibold text-sidebar-accent-foreground truncate">{user?.displayName || 'User'}</span>
              <span className="text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
}
    
