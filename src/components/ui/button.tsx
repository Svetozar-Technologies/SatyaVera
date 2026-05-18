"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "saffron" | "ghost" | "danger" | "link";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-navy-700 text-white border-transparent hover:bg-navy-800",
  saffron: "bg-saffron-600 text-white border-transparent hover:bg-saffron-700",
  ghost: "bg-transparent text-navy-700 border-ink-200 hover:bg-navy-50",
  danger: "bg-red-600 text-white border-transparent hover:bg-red-500",
  link: "bg-transparent text-navy-700 border-transparent p-0 hover:underline",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-[22px] py-3.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center gap-2 rounded-md font-semibold border cursor-pointer transition-colors font-sans ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
