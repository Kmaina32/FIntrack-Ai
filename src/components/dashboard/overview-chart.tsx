'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function OverviewChart({ transactions }: { transactions: Transaction[]}) {
  const overviewChartData = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const daysInMonth = eachDayOfInterval({ start, end });

    const monthlyData = daysInMonth.map(day => ({
        name: format(day, 'MMM dd'),
        total: 0,
    }));

    transactions.forEach(t => {
      const transactionDate = t.date instanceof Date ? t.date : new Date(t.date as string);
      if (transactionDate >= start && transactionDate <= end) {
        const dayOfMonth = format(transactionDate, 'MMM dd');
        const dataPoint = monthlyData.find(d => d.name === dayOfMonth);
        if (dataPoint) {
            dataPoint.total += t.type === 'Income' ? t.amount : -t.amount;
        }
      }
    });

    return monthlyData;

  }, [transactions]);

  return (
    <ChartContainer config={chartConfig} className='h-[350px] w-full'>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={overviewChartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value, index) => index % 5 === 0 ? value : ''}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${formatCurrency(value).slice(0, -3)}`}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
            content={<ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
              labelClassName="font-bold"
              indicator="dot"
               />}
          />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
