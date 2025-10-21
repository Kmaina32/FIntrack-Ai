import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { transactions } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

export function RecentTransactions() {
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      {recentTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{transaction.description.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {transaction.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {transaction.category}
            </p>
          </div>
          <div className={`ml-auto font-medium ${transaction.type === 'Income' ? 'text-green-600' : ''}`}>
            {transaction.type === 'Income' ? '+' : ''}
            {formatCurrency(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  );
}
