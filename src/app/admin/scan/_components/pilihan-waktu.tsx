"use client";

import { cn } from "@/lib/utils";

type WaktuOption = {
  id: string;
  label: string;
};

export function PilihanWaktu({
  options,
  selected,
  onSelect,
}: {
  options: WaktuOption[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold uppercase text-white transition-colors",
            selected === opt.id
              ? "bg-primary"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
