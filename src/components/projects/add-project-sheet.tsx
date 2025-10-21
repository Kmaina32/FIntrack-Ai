'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import type { Project } from '@/lib/types';
import { addDoc, collection } from 'firebase/firestore';
import { Textarea } from '../ui/textarea';

const projectStatuses: Project['status'][] = ['Not Started', 'In Progress', 'Completed', 'On Hold'];

export function AddProjectSheet() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const { firestore, user } = useFirebase();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add a project.' });
        return;
    }
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const status = formData.get('status') as Project['status'];
    const budget = formData.get('budget') as string;
    
    try {
      const projectData: Omit<Project, 'id'> = {
        userId: user.uid,
        name,
        description,
        status,
      };

      if (budget) {
        projectData.budget = parseFloat(budget);
      }

      await addDoc(collection(firestore, `users/${user.uid}/projects`), projectData);
      
      toast({
        title: "Project Added",
        description: "The new project has been successfully created.",
      });

      formRef.current?.reset();
      if(closeButtonRef.current) {
        closeButtonRef.current.click();
      }

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add project.",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit} ref={formRef}>
          <SheetHeader>
            <SheetTitle className="font-headline">Add Project</SheetTitle>
            <SheetDescription>
              Add a new project to track its finances.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="md:text-right">
                Name
              </Label>
              <Input name="name" id="name" placeholder="e.g. Website Redesign" className="md:col-span-3" required/>
            </div>
             <div className="grid md:grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="md:text-right pt-2">
                Description
              </Label>
              <Textarea name="description" id="description" placeholder="A short description of the project." className="md:col-span-3" />
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="md:text-right">
                Status
              </Label>
               <Select name="status" required defaultValue="Not Started">
                <SelectTrigger className="md:col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="budget" className="md:text-right">
                Budget
              </Label>
              <Input name="budget" id="budget" type="number" step="0.01" placeholder="e.g. 5000.00" className="md:col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="ghost" ref={closeButtonRef}>Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Project</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
    