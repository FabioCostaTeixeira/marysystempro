import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton = ({ className }: LoadingSkeletonProps) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
};

export const LoadingCard = ({ className }: LoadingSkeletonProps) => {
  return (
    <div className={cn("p-6 space-y-4", className)}>
      <LoadingSkeleton className="h-4 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
      <LoadingSkeleton className="h-4 w-2/3" />
    </div>
  );
};