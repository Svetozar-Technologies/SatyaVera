"use client";

import { HTMLAttributes, forwardRef } from "react";

type ChipVariant = "default" | "navy" | "saffron" | "green" | "red";

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
}

const variantClasses: Record<ChipVariant, string> = {
  default: "bg-ink-50 text-ink-700 border-ink-100",
  navy: "bg-navy-50 text-navy-700 border-navy-100",
  saffron: "bg-saffron-50 text-saffron-700 border-saffron-100",
  green: "bg-green-100 text-green-600 border-[#c8e2cd]",
  red: "bg-red-100 text-red-600 border-[#f1c5c1]",
};

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Chip.displayName = "Chip";
