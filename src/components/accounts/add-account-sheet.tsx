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
import { useAuth, useFirebase } from '@/firebase';
import type { Account } from '@/lib/types';
import { addDoc, collection } from 'firebase/firestore';

const accountTypes: Account['type'][] = ['Asset', 'Liability', 'Equity', 'Income', 'Expense'];

export function AddAccountSheet() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const auth = useAuth();
  const { firestore, user } = useFirebase();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add an account.' });
        return;
    }
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as Account['type'];
    
    try {
      await addDoc(collection(firestore, `users/${user.uid}/accounts`), {
        userId: user.uid,
        name,
        description,
        type,
      });
      
      toast({
        title: "Account Added",
        description: "The new account has been successfully created.",
      });

      formRef.current?.reset();
      if(closeButtonRef.current) {
        closeButtonRef.current.click();
      }

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add account.",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit} ref={formRef}>
          <SheetHeader>
            <SheetTitle className="font-headline">Add Account</SheetTitle>
            <SheetDescription>
              Add a new account to your Chart of Accounts.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="md:text-right">
                Name
              </Label>
              <Input name="name" id="name" placeholder="e.g. Office Supplies" className="md:col-span-3" required/>
            </div>
             <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="md:text-right">
                Description
              </Label>
              <Input name="description" id="description" placeholder="For office related expenses" className="md:col-span-3" />
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="md:text-right">
                Type
              </Label>
               <Select name="type" required>
                <SelectTrigger className="md:col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="ghost" ref={closeButtonRef}>Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Account</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
    