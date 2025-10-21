import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';

export function RecentTransactions({ transactions }: { transactions: Transaction[]}) {

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) { // Firebase Timestamp
      return format(date.toDate(), 'dd MMM, yyyy');
    }
    return format(new Date(date), 'dd MMM, yyyy');
  }


  return (
    <div className="space-y-8">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{transaction.description.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(transaction.date)}
            </p>
          </div>
          <div className={`ml-auto font-medium ${transaction.type === 'Income' ? 'text-green-600' : ''}`}>
            {transaction.amount > 0 ? '+' : ''}
            {formatCurrency(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
