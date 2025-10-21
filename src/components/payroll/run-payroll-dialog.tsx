'use client';

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Rocket } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { handleRunPayroll } from '@/lib/actions';
import { formatCurrency } from '@/lib/utils';

interface RunPayrollDialogProps {
    activeEmployees: Employee[];
}

export function RunPayrollDialog({ activeEmployees }: RunPayrollDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const totalPayroll = activeEmployees.reduce((acc, emp) => {
    if (emp.payType === 'Salary') {
      return acc + emp.payRate / 26; // Simplified: bi-weekly
    }
    return acc + emp.payRate * 80; // Simplified: 80 hours
  }, 0);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const result = await handleRunPayroll();

      if (result.success) {
        toast({
          title: 'Payroll Run Successfully!',
          description: `Paid ${formatCurrency(result.totalAmount)} to ${activeEmployees.length} employees.`,
        });
        setIsOpen(false);
      } else {
        throw new Error('Server action failed.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Payroll Run Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button disabled={activeEmployees.length === 0}>
          <Rocket className="mr-2 h-4 w-4" /> Run Payroll
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline">Confirm Payroll Run</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to run payroll for{' '}
            <strong>{activeEmployees.length} active employees</strong>. The estimated total payroll cost for this period is{' '}
            <strong>{formatCurrency(totalPayroll)}</strong>.
            <br /><br />
            This will create a single expense transaction for the total amount in your ledger. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm & Run Payroll
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
