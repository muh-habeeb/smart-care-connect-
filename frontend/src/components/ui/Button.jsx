import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Button = forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
        {
          "bg-primary text-white shadow-sm hover:shadow-md hover:bg-primary/90": variant === "default",
          "bg-red-500 text-white shadow-sm hover:shadow-md hover:bg-red-600": variant === "destructive",
          "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50": variant === "outline",
          "text-slate-500 hover:bg-slate-100 hover:text-slate-900": variant === "ghost",
          "h-11 px-6": size === "default",
          "h-9 px-4": size === "sm",
          "h-13 px-8 text-base": size === "lg",
          "h-10 w-10 p-0": size === "icon",
        },
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
