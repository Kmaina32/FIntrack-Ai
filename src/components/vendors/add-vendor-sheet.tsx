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
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';

export function AddVendorSheet() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const { firestore, user } = useFirebase();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to add a vendor.' });
        return;
    }
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    
    try {
      await addDoc(collection(firestore, `users/${user.uid}/vendors`), {
        userId: user.uid,
        name,
        email,
        phone,
        address
      });
      
      toast({
        title: "Vendor Added",
        description: "The new vendor has been successfully created.",
      });

      formRef.current?.reset();
      if(closeButtonRef.current) {
        closeButtonRef.current.click();
      }

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add vendor.",
      });
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Vendor
        </Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit} ref={formRef}>
          <SheetHeader>
            <SheetTitle className="font-headline">Add Vendor</SheetTitle>
            <SheetDescription>
              Add a new vendor to your supplier list.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input name="name" id="name" placeholder="e.g. Acme Inc." className="col-span-3" required/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input name="email" id="email" type="email" placeholder="contact@acme.com" className="col-span-3"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input name="phone" id="phone" placeholder="+1 (234) 567-890" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input name="address" id="address" placeholder="123 Business Rd, Suite 456" className="col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="ghost" ref={closeButtonRef}>Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Vendor</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
    
