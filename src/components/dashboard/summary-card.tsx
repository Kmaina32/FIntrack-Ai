import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SummaryCardData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { DollarSign } from "lucide-react";

export function SummaryCard({ title, value, change, period }: SummaryCardData) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(value)}</div>
        <p className="text-xs text-muted-foreground">
          <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
            {change >= 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>
          {` ${period}`}
        </p>
      </CardContent>
    </Card>
  );
}
