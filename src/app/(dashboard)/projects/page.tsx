'use client';

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Project } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectsTable } from "@/components/projects/projects-table";
import { AddProjectSheet } from "@/components/projects/add-project-sheet";
import { DashboardHeader } from "@/components/dashboard-header";

export default function ProjectsPage() {
  const { firestore, user } = useFirebase();

  const projectsQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/projects`),
      orderBy('name', 'asc')
    ) : null
  , [firestore, user]);

  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Projects">
        <AddProjectSheet />
      </DashboardHeader>
      {isLoading ? (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <ProjectsTable initialProjects={projects || []} />
      )}
    </div>
  );
