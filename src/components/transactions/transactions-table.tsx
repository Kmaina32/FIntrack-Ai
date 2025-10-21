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
import type { Transaction, Account, Project } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleAiCategorize, handleUpdateTransactionCategory } from '@/lib/actions';
import { useAuth, useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

const PAGE_SIZE = 10;

export function TransactionsTable({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions, setTransactions] = React.useState(initialTransactions);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loadingCategoryId, setLoadingCategoryId] = React.useState<string | null>(null);
  const { toast } = useToast();
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
  const projectMap = React.useMemo(() => projects?.reduce((map, proj) => ({ ...map, [proj.id]: proj.name }), {}) || {}, [projects]);


  React.useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleCategoryChange = async (transactionId: string, newAccount: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    if (newAccount === 'auto') {
      setLoadingCategoryId(transactionId);
      try {
        const result = await handleAiCategorize({
          transactionDescription: transaction.description,
          previousCategories: initialTransactions.slice(0, 10).map(t => ({ description: t.description, category: t.account })),
        });
        
        if (result && 'category' in result && result.category) {
          await updateTransactionAccount(transactionId, result.category);
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
      await updateTransactionAccount(transactionId, newAccount);
    }
  };
  
  const updateTransactionAccount = async (transactionId: string, account: string) => {
     try {
       if (!auth?.currentUser) {
         throw new Error("User not authenticated");
       }
       const idToken = await auth.currentUser.getIdToken();
      await handleUpdateTransactionCategory(transactionId, account, idToken);
      // The local state will be updated via the real-time listener,
      // so we don't need to call setTransactions here anymore.
    } catch (error) {
      console.error("Failed to update transaction account:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the transaction account.",
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
              <TableHead>Account</TableHead>
              <TableHead>Project</TableHead>
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
                    <Select onValueChange={(value) => handleCategoryChange(transaction.id, value)} value={transaction.account}>
                      <SelectTrigger className="w-[180px] h-8 text-xs">
                        <SelectValue asChild>
                           <Badge variant={getCategoryVariant(transaction.account)} className="capitalize truncate">
                            {transaction.account}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-categorize (AI)</SelectItem>
                        {accounts?.map(acc => (
                          <SelectItem key={acc.id} value={acc.name}>{acc.name}</SelectItem>
                        ))}
                         <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                    {transaction.projectId ? (
                        <Badge variant="secondary" className="truncate">{projectMap[transaction.projectId] || 'N/A'}</Badge>
                    ): <span className="text-muted-foreground text-xs">None</span>}
                </TableCell>
                <TableCell className={`text-right font-medium ${transaction.amount > 0 ? 'text-green-600' : ''}`}>
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
    
