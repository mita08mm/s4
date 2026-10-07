"use client";

import NumberFlow from "@number-flow/react";
import { PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { startTransition, useOptimistic, useState } from "react";
import { toast } from "sonner";

import { EnrollPicker } from "@/features/enrollments/components/enroll-picker";
import { EnrollmentList } from "@/features/enrollments/components/enrollment-list";
import type {
  EnrollmentItem,
  PickerOption,
} from "@/features/enrollments/types";
import { Button } from "@/shared/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";

type EnrollmentsPanelProps = {
  heading: string;
  items: EnrollmentItem[];
  options: PickerOption[];
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  addLabel: string;
  picker: { title: string; description: string; searchPlaceholder: string };
  removeLabel: (item: EnrollmentItem) => string;
  onEnroll: (
    ids: string[],
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  onRemove: (
    item: EnrollmentItem,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
};

/** Enrollments of one student or one class, with an optimistic "remove". */
export function EnrollmentsPanel(props: EnrollmentsPanelProps) {
  const { heading, items, options, picker } = props;
  const [pickerOpen, setPickerOpen] = useState(false);

  // The row disappears at once; if the server fails, React restores it.
  const [visibleItems, removeOptimistically] = useOptimistic(
    items,
    (current, id: string) => current.filter((item) => item.id !== id),
  );

  const enrolledIds = new Set(items.map((item) => item.id));
  const available = options.filter((option) => !enrolledIds.has(option.id));

  const remove = (item: EnrollmentItem) =>
    startTransition(async () => {
      removeOptimistically(item.id);
      const result = await props.onRemove(item);
      if (result.ok)
        toast.success("Inscripción eliminada", { description: item.title });
      else toast.error(result.message);
    });

  const enroll = async (ids: string[]) => {
    const result = await props.onEnroll(ids);
    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    toast.success(
      ids.length === 1
        ? "Inscripción realizada"
        : `${ids.length} inscripciones realizadas`,
    );
    return true;
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-medium tracking-tight">
          {heading}{" "}
          <NumberFlow
            value={visibleItems.length}
            className="text-muted-foreground tabular-nums"
          />
        </h2>
        <Button
          onClick={() => setPickerOpen(true)}
          variant="outline"
          className="rounded-full"
        >
          <PlusIcon />
          {props.addLabel}
        </Button>
      </div>

      {visibleItems.length === 0 ? (
        <Empty className="rounded-2xl border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">{props.emptyIcon}</EmptyMedia>
            <EmptyTitle>{props.emptyTitle}</EmptyTitle>
            <EmptyDescription>{props.emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <EnrollmentList
          items={visibleItems}
          removeLabel={props.removeLabel}
          onRemove={remove}
        />
      )}

      <EnrollPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title={picker.title}
        description={picker.description}
        searchPlaceholder={picker.searchPlaceholder}
        options={available}
        onConfirm={enroll}
      />
    </section>
  );
}
