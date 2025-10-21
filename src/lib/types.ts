import { Timestamp } from "firebase/firestore";

export type Transaction = {
  id: string;
  date: Timestamp | Date | string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
  bankAccountId?: string;
};

export type SummaryCardData = {
  title: string;
  value: number;
  change: number;
  period: string;
};

export type Report = {
  id: string;
  title: string;
  data: {
    category: string;
    value: number;
  }[];
};

export type User = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

export type BankAccount = {
  id: string;
  userId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
};

export type Category = {
    id: string;
    userId: string;
    name: string;
    description: string;
};
