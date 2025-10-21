export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  category: string;
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
  name: string;
  email: string;
  avatarUrl: string;
};
