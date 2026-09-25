import { ReactNode } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <Card className={cn("h-full flex flex-col items-center justify-center text-center p-8 bg-accent/20 border-dashed shadow-none min-h-[300px]", className)}>
      <div className="relative mb-4">
        {icon}
      </div>
      <CardTitle className="text-xl font-medium text-foreground mb-2">{title}</CardTitle>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="default">
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
