'use client';

import { useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { BarChart3, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleCreateReport } from '@/lib/actions';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { Sale } from '@/lib/types';
import { startOfDay, endOfDay } from 'date-fns';

export function ReportsDropdown() {
    const { toast } = useToast();
    const { firestore, user } = useFirebase();
    const [isLoading, setIsLoading] = useState(false);

    const today = new Date();
    const dailySalesQuery = useMemoFirebase(() => {
        if (!user) return null;
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);
        return query(
            collection(firestore, `users/${user.uid}/sales`),
            where('date', '>=', Timestamp.fromDate(startOfToday)),
            where('date', '<=', Timestamp.fromDate(endOfToday))
        )
    }, [firestore, user]);
    const { data: dailySales, isLoading: dailySalesLoading } = useCollection<Sale>(dailySalesQuery);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        try {
            if (!dailySales) {
                throw new Error('Daily sales data is not available.');
            }
            if (!user) {
                throw new Error("User is not authenticated.");
            }
            const idToken = await user.getIdToken();

            const reportData = {
                totalSales: dailySales.reduce((sum, sale) => sum + sale.total, 0),
                totalTax: dailySales.reduce((sum, sale) => sum + sale.tax, 0),
                totalTransactions: dailySales.length,
            };
            
            const payload = {
                type: 'End of Day' as const,
                data: reportData,
            };

            await handleCreateReport(payload, idToken);

            toast({
                title: 'Report Generated',
                description: 'End of Day report has been saved to your history.',
            });

        } catch (error: any) {
            console.error("Error generating report:", error);
            toast({
                variant: 'destructive',
                title: 'Report Generation Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isLoading || dailySalesLoading}>
                    {(isLoading || dailySalesLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
                    Reports
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={handleGenerateReport} disabled={isLoading || dailySalesLoading}>
                    Generate End of Day Report
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

    