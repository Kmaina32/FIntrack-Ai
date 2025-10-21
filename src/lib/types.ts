import { Timestamp } from "firebase/firestore";

export type Transaction = {
  id: string;
  date: Timestamp | Date | string;
  description: string;
  amount: number;
  type: 'Income' | 'Expense';
  account: string; // Changed from category
  bankAccountId?: string;
  projectId?: string;
};

export type SummaryCardData = {
  title: string;
  value: number;
  change: number;
  period: string;
};

export type Report = {
  id:string;
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

export type Account = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
};

export type Customer = {
  id: string;
  userId: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
};

export type Vendor = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  address?: string;
  phone?: string;
};

export type ReceiptData = {
  vendorName: string;
  transactionDate: string;
  description: string;
  totalAmount: number;
};

export type Project = {
    id: string;
    userId: string;
    name: string;
    description?: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
};

export type UserRole = {
    id: string;
    userId: string;
    email: string;
    role: 'Owner' | 'Admin' | 'Accountant' | 'Viewer';
};
    
export type InvoiceLineItem = {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
};

export type Invoice = {
    id: string;
    userId: string;
    customerId: string;
    customerName?: string; // Denormalized for easy display
    invoiceNumber: string;
    issueDate: Timestamp | Date;
    dueDate: Timestamp | Date;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Void';
    lineItems: InvoiceLineItem[];
    totalAmount: number;
};
