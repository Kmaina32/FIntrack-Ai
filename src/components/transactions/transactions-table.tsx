'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/lib/types';
import { transactionCategories } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleAiCategorize, handleUpdateTransactionCategory } from '@/lib/actions';

const PAGE_SIZE = 10;

export function TransactionsTable({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions, setTransactions] = React.useState(initialTransactions);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loadingCategoryId, setLoadingCategoryId] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleCategoryChange = async (transactionId: string, newCategory: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    if (newCategory === 'auto') {
      setLoadingCategoryId(transactionId);
      try {
        const result = await handleAiCategorize({
          transactionDescription: transaction.description,
          // You might want to provide better examples for categorization
          previousCategories: initialTransactions.slice(0, 10).map(t => ({ description: t.description, category: t.category })),
        });
        
        if (result && 'category' in result && result.category) {
          await updateTransactionCategory(transactionId, result.category);
          toast({
            title: "Auto-Categorized!",
            description: `Transaction set to "${result.category}" with ${Math.round(result.confidence * 100)}% confidence.`,
          });
        } else {
          throw new Error("AI categorization failed to return a category.");
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "AI Categorization Failed",
          description: "Could not automatically categorize the transaction.",
        });
      } finally {
        setLoadingCategoryId(null);
      }
    } else {
      await updateTransactionCategory(transactionId, newCategory);
    }
  };
  
  const updateTransactionCategory = async (transactionId: string, category: string) => {
     try {
      await handleUpdateTransactionCategory(transactionId, category);
      // The local state will be updated via the real-time listener,
      // so we don't need to call setTransactions here anymore.
    } catch (error) {
      console.error("Failed to update transaction category:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the transaction category.",
      });
    }
  };

  const getCategoryVariant = (category: string) => {
    switch(category) {
      case 'Income':
      case 'Client Revenue':
        return 'default';
      case 'Expense':
        return 'destructive';
      case 'Software':
      case 'Utilities':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) { // Firebase Timestamp
      return format(date.toDate(), 'dd MMM, yyyy');
    }
    return format(new Date(date), 'dd MMM, yyyy');
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  {loadingCategoryId === transaction.id ? (
                     <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Select onValueChange={(value) => handleCategoryChange(transaction.id, value)} value={transaction.category}>
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue asChild>
                           <Badge variant={getCategoryVariant(transaction.category)} className="capitalize truncate">
                            {transaction.category}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-categorize (AI)</SelectItem>
                        {transactionCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className={`text-right font-medium ${transaction.type === 'Income' ? 'text-green-600' : ''}`}>
                  {formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </>
  );
}
