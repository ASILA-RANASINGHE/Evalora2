"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string }
>(({ className, defaultValue, children, ...props }, ref) => {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <div ref={ref} className={cn("", className)} {...props} data-value={value}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { value, setValue });
        }
        return child;
      })}
    </div>
  );
});
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string; setValue?: (v: string) => void }
>(({ className, value, setValue, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground bg-gray-100",
      className
    )}
    {...props}
  >
    {React.Children.map(props.children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as any, { 
          selectedValue: value, 
          onClick: () => setValue && setValue(child.props.value) 
        });
      }
      return child;
    })}
  </div>
));
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  selectedValue?: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, selectedValue, onClick, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        selectedValue === value
          ? "bg-white text-foreground shadow-sm"
          : "hover:bg-gray-200 hover:text-gray-900",
        className
      )}
      {...props}
    />
  )
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; valueContext?: string }
>(({ className, value, ...props }, ref) => {
    // Note: In a real implementation we'd use Context, but here we're doing a quick hack with prop drilling from the parent Tabs
    // Since we can't easily drill down multiple levels without cloneElement context, this simple version relies on the parent passing props
    // But Tabs render children immediately. We actually need context.
    
    // Changing approach to use Context for reliability
    return null; 
});
TabsContent.displayName = "TabsContent";


// Retrying with Context
const TabsContext = React.createContext<{value: string, setValue: (v: string) => void} | null>(null);

const TabsRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string }
>(({ className, defaultValue, ...props }, ref) => {
  const [value, setValue] = React.useState(defaultValue || "");
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div ref={ref} className={cn("", className)} {...props} />
    </TabsContext.Provider>
  );
});
TabsRoot.displayName = "Tabs";

const TabsListRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
));
TabsListRoot.displayName = "TabsList";

const TabsTriggerRoot = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context?.value === value;
    return (
        <button
        ref={ref}
        type="button"
        onClick={() => context?.setValue(value)}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            isActive
            ? "bg-white text-black shadow-sm"
            : "hover:bg-gray-200 text-gray-500 hover:text-gray-900",
            className
        )}
        {...props}
        />
    );
  }
);
TabsTriggerRoot.displayName = "TabsTrigger";

const TabsContentRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
});
TabsContentRoot.displayName = "TabsContent";

export { TabsRoot as Tabs, TabsListRoot as TabsList, TabsTriggerRoot as TabsTrigger, TabsContentRoot as TabsContent };
