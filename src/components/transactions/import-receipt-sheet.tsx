'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
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
import { Upload, Loader2, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleAddTransaction, handleAnalyzeReceipt } from '@/lib/actions';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import type { Account, ReceiptData, Project } from '@/lib/types';
import { collection, query } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';


export function ImportReceiptSheet() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { firestore, user } = useFirebase();

  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [analyzedData, setAnalyzedData] = useState<ReceiptData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [date, setDate] = React.useState<Date | undefined>();

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        setAnalyzedData(null); // Reset analyzed data when new image is selected
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!receiptImage) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a receipt image first.' });
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await handleAnalyzeReceipt({ receiptImage });
      if ('error' in result) {
        throw new Error(result.error);
      }
      setAnalyzedData(result);
      if (result.transactionDate) {
        setDate(new Date(result.transactionDate));
      }
      toast({ title: "Analysis Complete", description: "Receipt data has been extracted." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Analysis Failed", description: error.message || "Could not analyze the receipt." });
      setAnalyzedData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    const formData = new FormData(event.currentTarget);
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const account = formData.get('account') as string;
    const projectId = formData.get('project') as string;
    
    const idToken = await user.getIdToken();

    try {
      const transactionPayload: any = {
        description,
        amount: -Math.abs(amount), // Receipts are always expenses
        type: 'Expense',
        account,
        date: date || new Date(),
      };
      
      if (projectId && projectId !== 'none') {
        transactionPayload.projectId = projectId;
      }

      await handleAddTransaction(transactionPayload, idToken);
      
      toast({
        title: "Transaction Added",
        description: "The receipt has been recorded as a transaction.",
      });

      resetState();
      closeButtonRef.current?.click();

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add transaction from receipt.",
      });
    }
  };

  const resetState = () => {
    setReceiptImage(null);
    setAnalyzedData(null);
    setIsAnalyzing(false);
    setDate(undefined);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }
  
  const handleSheetOpenChange = (open: boolean) => {
    if(!open) {
      resetState();
    }
  }

  return (
    <Sheet onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Import Receipt
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} ref={formRef}>
          <SheetHeader>
            <SheetTitle className="font-headline">Import Receipt</SheetTitle>
            <SheetDescription>
              Upload a receipt image to automatically extract transaction details with AI.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-2">
              <Label htmlFor="receipt-image">Receipt Image</Label>
              <Input 
                id="receipt-image" 
                name="receipt-image" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                ref={fileInputRef}
                className="text-sm"
                />
            </div>

            {receiptImage && (
              <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                <Image src={receiptImage} alt="Receipt preview" layout="fill" objectFit="contain" />
              </div>
            )}
            
            {receiptImage && !analyzedData && (
                <Button type="button" onClick={handleAnalyze} disabled={isAnalyzing}>
                    {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Analyzing...</> : "Analyze Receipt"}
                </Button>
            )}

            {analyzedData && (
                <>
                 <div className="grid md:grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="md:text-right">
                        Date
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "md:col-span-3 justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    </div>
                    <div className="grid md:grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="md:text-right">
                            Description
                        </Label>
                        <Input name="description" id="description" defaultValue={analyzedData.description} className="md:col-span-3" required/>
                    </div>
                    <div className="grid md:grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="md:text-right">
                            Amount
                        </Label>
                        <Input name="amount" id="amount" type="number" step="0.01" defaultValue={analyzedData.totalAmount} className="md:col-span-3" required/>
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
                </>
            )}

          </div>
          <SheetFooter>
            <SheetClose asChild>
                <Button type="button" variant="ghost" ref={closeButtonRef} onClick={resetState}>Cancel</Button>
            </SheetClose>
            {analyzedData && <Button type="submit">Save Transaction</Button>}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
