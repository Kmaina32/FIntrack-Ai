
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
import { addDoc, collection } from 'firebase/firestore';
import type { Employee } from '@/lib/types';

const payTypes: Employee['payType'][] = ['Hourly', 'Salary'];
const statuses: Employee['status'][] = ['Active', 'Inactive'];

export function AddEmployeeSheet() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const { firestore, user } = useFirebase();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add an employee.' });
        return;
    }
    const formData = new FormData(event.currentTarget);
    const employeeData = {
        userId: user.uid,
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        payRate: parseFloat(formData.get('payRate') as string),
        payType: formData.get('payType') as Employee['payType'],
        status: formData.get('status') as Employee['status'],
    };
    
    try {
      await addDoc(collection(firestore, `users/${user.uid}/employees`), employeeData);
      
      toast({
        title: "Employee Added",
        description: "The new employee has been successfully created.",
      });

      formRef.current?.reset();
      if(closeButtonRef.current) {
        closeButtonRef.current.click();
      }

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add employee.",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit} ref={formRef}>
          <SheetHeader>
            <SheetTitle className="font-headline">Add Employee</SheetTitle>
            <SheetDescription>
              Add a new employee to your payroll system.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="md:text-right">Name</Label>
              <Input name="name" id="name" placeholder="e.g. Jane Doe" className="md:col-span-3" required/>
            </div>
             <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="md:text-right">Email</Label>
              <Input name="email" id="email" type="email" placeholder="jane.doe@example.com" className="md:col-span-3" required/>
            </div>
             <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="md:text-right">Phone</Label>
              <Input name="phone" id="phone" placeholder="+1 (234) 567-890" className="md:col-span-3" />
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
                <Label htmlFor="payType" className="md:text-right">Pay Type</Label>
                <Select name="payType" required defaultValue="Hourly">
                    <SelectTrigger className="md:col-span-3">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        {payTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
              <Label htmlFor="payRate" className="md:text-right">Pay Rate</Label>
              <Input name="payRate" id="payRate" type="number" step="0.01" placeholder="0.00" className="md:col-span-3" required/>
            </div>
            <div className="grid md:grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="md:text-right">Status</Label>
                <Select name="status" required defaultValue="Active">
                    <SelectTrigger className="md:col-span-3">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="ghost" ref={closeButtonRef}>Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Employee</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
