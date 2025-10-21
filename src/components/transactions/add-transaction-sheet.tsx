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
import { transactionCategories } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { handleAddTransaction } from '@/lib/actions';

export function AddTransactionSheet() {
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const type = formData.get('type') as 'Income' | 'Expense';
    const category = formData.get('category') as string;

    try {
      await handleAddTransaction({
        description,
        amount: type === 'Expense' ? -Math.abs(amount) : Math.abs(amount),
        type,
        category,
        date: new Date(),
      });
      
      toast({
        title: "Transaction Added",
        description: "Your new transaction has been successfully recorded.",
      });

      formRef.current?.reset();
      closeButtonRef.current?.click();

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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input name="description" id="description" placeholder="e.g. Office supplies" className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input name="amount" id="amount" type="number" step="0.01" placeholder="0.00" className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
               <Select name="type" required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select name="category" required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {transactionCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
            </SheetClose>
            <Button type="submit">Save Transaction</Button>
          </SheetFooter>
        </form>
        <SheetClose ref={closeButtonRef} className="hidden" />
      </SheetContent>
    </Sheet>
  );
}
