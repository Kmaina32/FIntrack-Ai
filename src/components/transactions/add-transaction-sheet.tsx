
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
import { handleAddTransaction } from '@/lib/actions';
import { useAuth, useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import type { Account, Project } from '@/lib/types';
import { collection, query } from 'firebase/firestore';

export function AddTransactionSheet() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const auth = useAuth();
  const { firestore, user } = useFirebase();

  const accountsQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, `users/${user.uid}/accounts`)) : null,
    [firestore, user]
  );
  const { data: accounts } = useCollection<Account>(accountsQuery);

  const projectsQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, `users/${user.uid}/projects`)) : null,
    [firestore, user]
  );
  const { data: projects } = useCollection<Project>(projectsQuery);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const type = formData.get('type') as 'Income' | 'Expense';
    const account = formData.get('account') as string;
    const projectId = formData.get('project') as string;
    
    if (!auth?.currentUser) {
       toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to add a transaction.",
      });
      return;
    }
    
    const idToken = await auth.currentUser.getIdToken();

    try {
      const transactionPayload: any = {
        description,
        amount: type === 'Expense' ? -Math.abs(amount) : Math.abs(amount),
        type,
        account,
        date: new Date(),
      };

      if (projectId && projectId !== 'none') {
        transactionPayload.projectId = projectId;
      }

      await handleAddTransaction(transactionPayload, idToken);
      
      toast({
        title: "Transaction Added",
        description: "Your new transaction has been successfully recorded.",
      });

      formRef.current?.reset();
      // Programmatically click the close button
      if(closeButtonRef.current) {
        closeButtonRef.current.click();
      }

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add transaction.",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit} ref={formRef}>
          <SheetHeader>
            <SheetTitle className="font-headline">Add Transaction</SheetTitle>
            <SheetDescription>
              Manually add a new income or expense to your records.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="md:text-right">
                Description
              </Label>
              <Input name="description" id="description" placeholder="e.g. Office supplies" className="md:col-span-3" required/>
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="md:text-right">
                Amount
              </Label>
              <Input name="amount" id="amount" type="number" step="0.01" placeholder="0.00" className="md:col-span-3" required/>
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="md:text-right">
                Type
              </Label>
               <Select name="type" required defaultValue="Expense">
                <SelectTrigger className="md:col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="account" className="md:text-right">
                Account
              </Label>
              <Select name="account" required>
                <SelectTrigger className="md:col-span-3">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((acc) => (
                    <SelectItem key={acc.id} value={acc.name}>
                      {acc.name}
                    </SelectItem>
                  ))}
                   <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="md:text-right">
                Project
              </Label>
              <Select name="project">
                <SelectTrigger className="md:col-span-3">
                  <SelectValue placeholder="Assign to a project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects?.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="ghost" ref={closeButtonRef}>Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Transaction</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
