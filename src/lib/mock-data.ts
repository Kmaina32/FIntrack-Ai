import type { Transaction, Report, SummaryCardData, User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const user: User = {
  id: '1',
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || '',
};

export const transactionCategories = [
  "Client Revenue", "Consulting", "Transfers", "Income",
  "Software", "Office Supplies", "Rent", "Utilities", "Meals & Entertainment",
  "Hardware", "Transport", "Marketing", "Taxes", "Salaries", "Bank Fees",
  "Expense", "Uncategorized"
];
