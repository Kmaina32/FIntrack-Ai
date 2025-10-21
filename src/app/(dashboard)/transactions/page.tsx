import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Upload } from "lucide-react";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { transactions as allTransactions } from "@/lib/mock-data";
import { AddTransactionSheet } from "@/components/transactions/add-transaction-sheet";

export default function TransactionsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Transactions
        </h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Statement
          </Button>
          <AddTransactionSheet />
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <TransactionsTable initialTransactions={allTransactions} />
    </div>
  );
}
