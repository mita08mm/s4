import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/shared/ui/button";

type PaginationLinksProps = {
  page: number;
  size: number;
  total: number;
  /** Builds the URL of a page, keeping the other query parameters. */
  hrefFor: (page: number) => string;
};

export function PaginationLinks({
  page,
  size,
  total,
  hrefFor,
}: PaginationLinksProps) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (total === 0) return null;
  const from = (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  return (
    <nav
      aria-label="Paginación"
      className="flex items-center justify-between text-sm"
    >
      <p className="text-muted-foreground tabular-nums">
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-1">
        <PageButton
          href={page > 1 ? hrefFor(page - 1) : null}
          label="Página anterior"
        >
          <ChevronLeftIcon />
        </PageButton>
        <span className="min-w-16 text-center text-muted-foreground tabular-nums">
          {page} / {pages}
        </span>
        <PageButton
          href={page < pages ? hrefFor(page + 1) : null}
          label="Página siguiente"
        >
          <ChevronRightIcon />
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: React.ReactNode;
}) {
  if (href === null) {
    return (
      <Button variant="outline" size="icon" disabled aria-label={label}>
        {children}
      </Button>
    );
  }
  return (
    <Button variant="outline" size="icon" asChild>
      <Link href={href} aria-label={label} scroll={false}>
        {children}
      </Link>
    </Button>
  );
}
