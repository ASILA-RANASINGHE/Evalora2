"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { defaultChecked?: boolean, onCheckedChange?: (checked: boolean) => void }
>(({ className, defaultChecked, onCheckedChange, ...props }, ref) => {
    const [checked, setChecked] = React.useState(defaultChecked || false);
    
    const toggle = () => {
        const newValue = !checked;
        setChecked(newValue);
        onCheckedChange?.(newValue);
    }

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            ref={ref}
            onClick={toggle}
            className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-purple-600" : "bg-gray-200",
            className
            )}
            {...props}
        >
            <span
            className={cn(
                "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
                checked ? "translate-x-5" : "translate-x-0"
            )}
            />
        </button>
    )
})
Switch.displayName = "Switch"

export { Switch }
