"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useState, useTransition } from "react";

import type { PickerOption } from "@/features/enrollments/types";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Spinner } from "@/shared/ui/spinner";

type EnrollPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  searchPlaceholder: string;
  /** Only the options that are not enrolled yet. */
  options: PickerOption[];
  /** Resolves to `true` when the enrollment succeeded. */
  onConfirm: (ids: string[]) => Promise<boolean>;
};

/** Searchable multi-select to enroll several items at once. */
export function EnrollPicker({
  open,
  onOpenChange,
  title,
  description,
  searchPlaceholder,
  options,
  onConfirm,
}: EnrollPickerProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

  const changeOpen = (next: boolean) => {
    if (!next) setSelected([]);
    onOpenChange(next);
  };

  const confirm = () =>
    startTransition(async () => {
      if (await onConfirm(selected)) changeOpen(false);
    });

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Command className="rounded-none border-y">
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList className="max-h-72">
            <CommandEmpty>
              {options.length === 0
                ? "Ya está inscrito en todo."
                : "Sin resultados."}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.id);
                return (
                  <CommandItem
                    key={option.id}
                    value={`${option.code} ${option.label} ${option.hint}`}
                    onSelect={() => toggle(option.id)}
                    className="gap-3 py-2.5"
                  >
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-[5px] border transition-colors",
                        isSelected &&
                          "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            <CheckIcon className="size-3" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                    <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
                      {option.code}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">
                        {option.label}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {option.hint}
                      </span>
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>

        <DialogFooter className="m-0 flex-row items-center justify-between rounded-none p-4 sm:justify-between">
          <span className="text-sm text-muted-foreground tabular-nums">
            {selected.length} seleccionada{selected.length === 1 ? "" : "s"}
          </span>
          <Button
            onClick={confirm}
            disabled={selected.length === 0 || isPending}
          >
            {isPending && <Spinner />}
            Inscribir{selected.length > 0 ? ` (${selected.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
