'use client';

import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Project } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectsTable } from "@/components/projects/projects-table";
import { AddProjectSheet } from "@/components/projects/add-project-sheet";

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
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Projects
        </h1>
        <div className="flex items-center space-x-2">
          <AddProjectSheet />
        </div>
      </div>
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
}
    
