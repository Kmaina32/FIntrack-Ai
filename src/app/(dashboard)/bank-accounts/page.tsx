'use client';

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function BankAccountsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DashboardHeader title="Bank Accounts">
                <Button disabled>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Bank Account
                </Button>
            </DashboardHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                    <CardDescription>
                        Manage your connected bank accounts and reconcile statements.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This section will allow you to link your bank accounts, import statements, and reconcile your transactions to ensure your books are accurate.</p>
                </CardContent>
            </Card>
        </div>
    )
}
