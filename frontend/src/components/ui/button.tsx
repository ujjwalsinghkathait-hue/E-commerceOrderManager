import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-gradient-to-r from-zinc-900 to-zinc-800 text-white shadow-md shadow-zinc-900/20 hover:from-zinc-800 hover:to-zinc-700 hover:shadow-lg disabled:opacity-50 dark:from-zinc-100 dark:to-zinc-200 dark:text-zinc-900 dark:shadow-none dark:hover:from-white dark:hover:to-zinc-100",
  secondary:
    "border border-zinc-300 bg-white/90 shadow-sm hover:border-zinc-400 hover:bg-white hover:shadow disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:hover:border-zinc-500 dark:hover:bg-zinc-900",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:text-zinc-200 dark:hover:bg-zinc-900",
  danger:
    "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/25 hover:from-red-500 hover:to-red-500 disabled:opacity-50 dark:from-red-700 dark:to-red-600",
};

export function Button({
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 hover:brightness-[1.03] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 dark:focus-visible:ring-offset-zinc-950 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
