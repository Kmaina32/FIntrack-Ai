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
import { overviewChartData } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { ChartTooltipContent, ChartContainer, type ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function OverviewChart() {
  return (
    <ChartContainer config={chartConfig}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={overviewChartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
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
