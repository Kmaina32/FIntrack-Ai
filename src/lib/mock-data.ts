import type { Transaction, Report, SummaryCardData, User } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const user: User = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar')?.imageUrl || '',
};

export const summaryCards: SummaryCardData[] = [
  {
    title: 'Total Revenue',
    value: 45231.89,
    change: 20.1,
    period: 'from last month',
  },
  {
    title: 'Total Expenses',
    value: 28430.55,
    change: -5.2,
    period: 'from last month',
  },
  {
    title: 'Net Income',
    value: 16801.34,
    change: 15.3,
    period: 'from last month',
  },
  {
    title: 'Cash Flow',
    value: 12150.70,
    change: 180.1,
    period: 'from last month',
  },
];

export const transactions: Transaction[] = [
  { id: '1', date: '2023-10-26', description: "Client Payment - Project Phoenix", amount: 5000.00, type: 'Income', category: 'Client Revenue' },
  { id: '2', date: '2023-10-25', description: "Software Subscription - Figma", amount: -45.00, type: 'Expense', category: 'Software' },
  { id: '3', date: '2023-10-24', description: "M-Pesa: Office Supplies", amount: -120.80, type: 'Expense', category: 'Office Supplies' },
  { id: '4', date: '2023-10-23', description: "Monthly Rent - Office Space", amount: -1500.00, type: 'Expense', category: 'Rent' },
  { id: '5', date: '2023-10-22', description: "M-Pesa: Internet Bill", amount: -75.00, type: 'Expense', category: 'Utilities' },
  { id: '6', date: '2023-10-21', description: "Client Payment - Project Atlas", amount: 7500.00, type: 'Income', category: 'Client Revenue' },
  { id: '7', date: '2023-10-20', description: "Lunch Meeting with Investors", amount: -85.50, type: 'Expense', category: 'Meals & Entertainment' },
  { id: '8', date: '2023-10-19', description: "Hardware Purchase - New Laptop", amount: -1800.00, type: 'Expense', category: 'Hardware' },
  { id: '9', date: '2023-10-18', description: "M-Pesa: Electricity Bill", amount: -110.25, type: 'Expense', category: 'Utilities' },
  { id: '10', date: '2023-10-17', description: "Consulting Fee", amount: 2000.00, type: 'Income', category: 'Consulting' },
  { id: '11', date: '2023-10-16', description: "Transport - Uber to meeting", amount: -25.00, type: 'Expense', category: 'Transport' },
  { id: '12', date: '2023-10-15', description: "Ad Spend - Google Ads", amount: -300.00, type: 'Expense', category: 'Marketing' },
  { id: '13', date: '2023-10-14', description: "Bank Transfer from Savings", amount: 1000.00, type: 'Income', category: 'Transfers' },
  { id: '14', date: '2023-10-13', description: "M-Pesa: KRA Tax Payment", amount: -450.00, type: 'Expense', category: 'Taxes' },
  { id: '15', date: '2023-10-12', description: "Coffee for the team", amount: -35.70, type: 'Expense', category: 'Meals & Entertainment' },
  { id: '16', date: '2023-10-11', description: "Salary - J. Doe", amount: -2500.00, type: 'Expense', category: 'Salaries' },
  { id: '17', date: '2023-10-10', description: "Salary - A. Smith", amount: -2500.00, type: 'Expense', category: 'Salaries' },
  { id: '18', date: '2023-10-09', description: "Client Retainer - Acme Corp", amount: 3000.00, type: 'Income', category: 'Client Revenue' },
  { id: '19', date: '2023-10-08', description: "Domain Renewal - GoDaddy", amount: -18.99, type: 'Expense', category: 'Software' },
  { id: '20', date: '2023-10-07', description: "M-Pesa: Withdrawal Fee", amount: -1.50, type: 'Expense', category: 'Bank Fees' },
];

export const transactionCategories = [
  "Client Revenue", "Consulting", "Transfers",
  "Software", "Office Supplies", "Rent", "Utilities", "Meals & Entertainment",
  "Hardware", "Transport", "Marketing", "Taxes", "Salaries", "Bank Fees",
  "Uncategorized"
];

export const overviewChartData = [
  { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Feb', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Apr', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'May', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Jul', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Aug', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Sep', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Oct', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Nov', total: Math.floor(Math.random() * 5000) + 1000 },
  { name: 'Dec', total: Math.floor(Math.random() * 5000) + 1000 },
];

export const reports: Report[] = [
  {
    id: 'income-statement',
    title: 'Income Statement',
    data: [
      { category: 'Total Revenue', value: 75000 },
      { category: 'Cost of Goods Sold', value: -25000 },
      { category: 'Gross Profit', value: 50000 },
      { category: 'Operating Expenses', value: -20000 },
      { category: 'Operating Income', value: 30000 },
      { category: 'Taxes', value: -7500 },
      { category: 'Net Income', value: 22500 },
    ],
  },
  {
    id: 'balance-sheet',
    title: 'Balance Sheet',
    data: [
      { category: 'Cash', value: 50000 },
      { category: 'Accounts Receivable', value: 15000 },
      { category: 'Inventory', value: 30000 },
      { category: 'Total Assets', value: 95000 },
      { category: 'Accounts Payable', value: 10000 },
      { category: 'Long-term Debt', value: 25000 },
      { category: 'Total Liabilities', value: 35000 },
      { category: 'Equity', value: 60000 },
      { category: 'Total Liabilities & Equity', value: 95000 },
    ],
  },
  {
    id: 'cash-flow',
    title: 'Cash Flow Statement',
    data: [
      { category: 'Cash from Operations', value: 40000 },
      { category: 'Cash from Investing', value: -10000 },
      { category: 'Cash from Financing', value: -5000 },
      { category: 'Net Change in Cash', value: 25000 },
    ],
  },
];
