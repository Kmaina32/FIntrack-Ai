'use client';

import { SidebarTrigger } from './ui/sidebar';

export function DashboardHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          {title}
        </h1>
      </div>
      <div className="flex items-center space-x-2">{children}</div>
    </div>
  );
}
