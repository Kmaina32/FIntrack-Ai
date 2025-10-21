'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
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
  Users2,
  Settings,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { useAuth, useUser } from '@/firebase';
import { Button } from './ui/button';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    icon: Briefcase,
  },
  {
    href: '/reports',
    label: 'Reports',
    icon: BarChart3,
  },
  {
    href: '/team',
    label: 'Team',
    icon: Users2,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const { state } = useSidebar();

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
    }
  };
  
  const userMenuTrigger = (
    <div className="flex w-full items-center justify-between p-2 rounded-md transition-colors duration-200 hover:bg-sidebar-accent">
      <div className="flex items-center gap-2">
        <Avatar className="h-9 w-9">
          {user?.photoURL && (
            <AvatarImage
              src={user.photoURL}
              alt={user.displayName || 'user'}
              data-ai-hint="person portrait"
            />
          )}
          <AvatarFallback>
            {user?.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-sm truncate">
          <span className="font-semibold text-sidebar-accent-foreground truncate">
            {user?.displayName || 'User'}
          </span>
          <span className="text-muted-foreground truncate">{user?.email}</span>
        </div>
      </div>
    </div>
  );

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
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {state === 'expanded' ? (
                userMenuTrigger
              ) : (
              <Button variant="ghost" size="icon" className='w-full h-auto p-2'>
                 <Avatar className="h-9 w-9">
                  {user?.photoURL && (
                    <AvatarImage
                      src={user.photoURL}
                      alt={user.displayName || 'user'}
                      data-ai-hint="person portrait"
                    />
                  )}
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                 <Link href="/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile & Settings</span>
                 </Link>
              </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </>
  );
}
