import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", noPadding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-paper border border-ink-100 rounded-[10px] shadow-sh-1 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
