
'use client';

import { useState } from 'react';
import { useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { Employee, PayrollRun } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from '@/components/ui/button';
import { PlusCircle, Rocket } from 'lucide-react';
import { AddEmployeeSheet } from '@/components/payroll/add-employee-sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeesTable } from '@/components/payroll/employees-table';
import { PayrollHistoryTable } from '@/components/payroll/payroll-history-table';

export default function PayrollPage() {
  const { firestore, user } = useFirebase();
  const [activeTab, setActiveTab] = useState('employees');

  const employeesQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/employees`),
      orderBy('name', 'asc')
    ) : null
  , [firestore, user]);
  const { data: employees, isLoading: employeesLoading } = useCollection<Employee>(employeesQuery);

  const payrollRunsQuery = useMemoFirebase(() => 
    user ? query(
      collection(firestore, `users/${user.uid}/payrollRuns`),
      orderBy('runDate', 'desc')
    ) : null
  , [firestore, user]);
  const { data: payrollRuns, isLoading: payrollRunsLoading } = useCollection<PayrollRun>(payrollRunsQuery);


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader title="Payroll">
        <Button disabled>
            <Rocket className="mr-2 h-4 w-4" /> Run Payroll
        </Button>
        {activeTab === 'employees' && <AddEmployeeSheet />}
      </DashboardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="history">Payroll History</TabsTrigger>
        </TabsList>
        <TabsContent value="employees">
            {employeesLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
                <EmployeesTable initialEmployees={employees || []} />
            )}
        </TabsContent>
        <TabsContent value="history">
             {payrollRunsLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : (
                <PayrollHistoryTable initialPayrollRuns={payrollRuns || []} />
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
