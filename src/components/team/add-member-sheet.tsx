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
import type { UserRole } from '@/lib/types';
import { addDoc, collection } from 'firebase/firestore';

const userRoles: Exclude<UserRole['role'], 'Owner'>[] = ['Admin', 'Accountant', 'Viewer'];

export function AddMemberSheet() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const { firestore, user } = useFirebase();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add a team member.' });
        return;
    }
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const role = formData.get('role') as UserRole['role'];
    
    try {
      // In a real app, this would trigger an invitation flow.
      // For now, we'll just add the role directly. A user must then sign up with this email.
      const userRolesRef = collection(firestore, `users/${user.uid}/userRoles`);
      await addDoc(userRolesRef, {
        email: email.toLowerCase(),
        role: role,
      });
      
      toast({
        title: "Member Invited",
        description: `${email} has been invited as a(n) ${role}. They will gain access after signing up.`,
      });

      formRef.current?.reset();
      if(closeButtonRef.current) {
        closeButtonRef.current.click();
      }

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to invite member.",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit} ref={formRef}>
          <SheetHeader>
            <SheetTitle className="font-headline">Invite Team Member</SheetTitle>
            <SheetDescription>
              Invite a new member to your team by email. They will gain access once they sign up with this email.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input name="email" id="email" type="email" placeholder="member@example.com" className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
               <Select name="role" required defaultValue="Viewer">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="ghost" ref={closeButtonRef}>Cancel</Button>
            </SheetClose>
            <Button type="submit">Send Invitation</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
