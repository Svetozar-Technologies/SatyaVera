"use client";

import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  options?: string[];
  textarea?: boolean;
  rows?: number;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  type?: string;
  hint?: string;
}

export function Field({
  label,
  placeholder,
  prefix,
  suffix,
  options,
  textarea,
  rows = 4,
  className = "",
  value,
  onChange,
  type = "text",
  hint,
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs font-semibold text-ink-700">{label}</label>
      <div className="flex items-center border border-ink-200 rounded-lg px-3 bg-white focus-within:border-navy-500 transition-colors">
        {prefix && <span className="mr-2 text-ink-500 text-sm">{prefix}</span>}
        {options ? (
          <select
            className="flex-1 py-2.5 border-0 bg-transparent font-sans text-[13px] text-ink-900 outline-none appearance-none cursor-pointer"
            value={value}
            onChange={onChange}
          >
            {options.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        ) : textarea ? (
          <textarea
            className="flex-1 py-2.5 border-0 bg-transparent font-sans text-[13px] text-ink-900 outline-none resize-none w-full"
            placeholder={placeholder}
            rows={rows}
            value={value}
            onChange={onChange}
          />
        ) : (
          <input
            type={type}
            className="flex-1 py-2.5 border-0 bg-transparent font-sans text-[13px] text-ink-900 outline-none w-full"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        )}
        {suffix}
      </div>
      {hint && <span className="text-[11px] text-ink-500">{hint}</span>}
    </div>
  );
}
