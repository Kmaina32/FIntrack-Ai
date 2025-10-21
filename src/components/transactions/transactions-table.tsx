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
import { transactionCategories, transactions as mockTransactions } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleCategorizeTransaction } from '@/lib/actions';

const PAGE_SIZE = 10;

export function TransactionsTable({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions, setTransactions] = React.useState(initialTransactions);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loadingCategoryId, setLoadingCategoryId] = React.useState<string | null>(null);
  const { toast } = useToast();

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
        const result = await handleCategorizeTransaction({
          transactionDescription: transaction.description,
          previousCategories: mockTransactions.map(t => ({ description: t.description, category: t.category })),
        });
        
        if ('category' in result && result.category) {
          updateTransactionCategory(transactionId, result.category);
          toast({
            title: "Auto-Categorized!",
            description: `Transaction set to "${result.category}" with ${Math.round(result.confidence * 100)}% confidence.`,
          });
        } else {
          throw new Error("AI categorization failed.");
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "AI Categorization Failed",
          description: "Could not automatically categorize the transaction.",
        });
      } finally {
        setLoadingCategoryId(null);
      }
    } else {
      updateTransactionCategory(transactionId, newCategory);
    }
  };
  
  const updateTransactionCategory = (transactionId: string, category: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === transactionId ? { ...t, category } : t))
    );
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
                <TableCell className="font-medium">{format(new Date(transaction.date), 'dd MMM, yyyy')}</TableCell>
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
