import { Skeleton } from "@/shared/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-32 pb-24 sm:pt-36">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-10 w-48 rounded-full" />
      </div>
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["a", "b", "c", "d", "e", "f"].map((key) => (
          <Skeleton key={key} className="h-48 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
