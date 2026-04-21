import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

type EmptyStateProps = {
  message: ReactNode;
  children?: ReactNode;
  className?: string;
};

export const EmptyState = ({
  message,
  children,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-4 py-12 text-center",
      className,
    )}
  >
    <p className="text-muted-foreground">{message}</p>
    {children}
  </div>
);
