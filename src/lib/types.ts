

import { Timestamp } from "firebase/firestore";

export type Transaction = {
  id: string;
  userId: string;
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
  role?: 'Owner' | 'Admin' | 'Accountant' | 'Viewer';
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
  userId:string;
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
    budget?: number;
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
    total?: number; // Made optional as it can be calculated
};

export type Invoice = {
    id: string;
    userId: string;
    customerId: string;
    customerName: string; // Denormalized for easy display
    invoiceNumber: string;
    issueDate: Timestamp | Date | string;
    dueDate: Timestamp | Date | string;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Void';
    lineItems: InvoiceLineItem[];
    totalAmount: number;
};

export type Product = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  price: number;
  quantityInStock: number;
  imageUrl?: string;
};

export type CartItem = Product & {
  quantity: number;
};

export type Sale = {
  id: string;
  userId: string;
  lineItems: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: Timestamp | Date | string;
};

export type Employee = {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone?: string;
    payRate: number;
    payType: 'Hourly' | 'Salary';
    status: 'Active' | 'Inactive';
};

export type PayrollRun = {
    id: string;
    userId: string;
    runDate: Timestamp | Date | string;
    totalAmount: number;
    employeeCount: number;
};

export type ChatMessage = {
    id: string;
    userId: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Timestamp | Date | string;
};
