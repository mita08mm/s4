"use client";

import { motion } from "framer-motion";
import { PencilIcon } from "lucide-react";
import { useState } from "react";

import { ClassSheet } from "@/features/classes/components/class-sheet";
import type { SchoolClass } from "@/features/classes/types";
import { BackLink } from "@/shared/ui/back-link";
import { Button } from "@/shared/ui/button";

export function ClassProfile({ schoolClass }: { schoolClass: SchoolClass }) {
  const [editing, setEditing] = useState(false);

  return (
    <header className="flex flex-col gap-6">
      <BackLink href="/classes" label="Clases" />
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-start gap-5"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <span className="w-fit rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
            {schoolClass.code}
          </span>
          <h1 className="text-4xl font-semibold tracking-tighter sm:text-5xl">
            {schoolClass.title}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            {schoolClass.description ?? (
              <span className="italic">Sin descripción</span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => setEditing(true)}
        >
          <PencilIcon />
          Editar
        </Button>
      </motion.div>
      <ClassSheet
        open={editing}
        schoolClass={schoolClass}
        onOpenChange={setEditing}
      />
    </header>
  );
}
