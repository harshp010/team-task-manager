import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) => (
  <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed bg-card/50 p-8 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-secondary">
      <Icon className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    {actionLabel && onAction && (
      <Button className="mt-5" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);
