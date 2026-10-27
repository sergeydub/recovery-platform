import { Skeleton } from "@/components/ui/skeleton";

// Pages here read the session, which is only known at request time, so they
// stream in behind this placeholder while the top bar renders immediately.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
