"use client";

import { SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

import { Input } from "@/shared/ui/input";
import { Spinner } from "@/shared/ui/spinner";

const DEBOUNCE_MS = 300;

/** How the API search behaves (see the README). */
export const SEARCH_HINT =
  "Sin distinguir mayúsculas. Con varias palabras, cada una debe aparecer en algún campo.";

type UrlSearchInputProps = {
  defaultValue: string;
  placeholder: string;
  label: string;
  hint?: string;
};

/** Search box that keeps the query in the URL (`?q=`), so results can be shared. */
export function UrlSearchInput({
  defaultValue,
  placeholder,
  label,
  hint,
}: UrlSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeout.current), []);

  const search = (value: string) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      const query = value.trim();
      if (query) params.set("q", query);
      else params.delete("q");
      params.delete("page"); // a new search starts on the first page
      startTransition(() =>
        router.replace(`${pathname}?${params}`, { scroll: false }),
      );
    }, DEBOUNCE_MS);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          defaultValue={defaultValue}
          onChange={(event) => search(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="h-11 rounded-xl pr-10 pl-10 text-base md:text-sm"
        />
        {isPending && (
          <Spinner className="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>
      {hint && <p className="px-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
