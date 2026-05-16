import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneClasses = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-500",
  warning: "bg-amber-500/10 text-amber-500",
  danger: "bg-red-500/10 text-red-500"
};

export const StatCard = ({ label, value, icon: Icon, tone = "default" }: StatCardProps) => (
  <Card>
    <CardContent className="flex items-center justify-between p-5">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-normal">{value}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-md ${toneClasses[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
);
