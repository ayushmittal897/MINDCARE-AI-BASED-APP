import { cn } from "@/lib/utils";
import { createContext, useContext, useState, type ReactNode } from "react";

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className }: { defaultValue?: string; value?: string; onValueChange?: (v: string) => void; children: ReactNode; className?: string }) {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  
  const setValue = (v: string) => {
    if (!isControlled) {
      setInternalValue(v);
    }
    if (onValueChange) {
      onValueChange(v);
    }
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("inline-flex h-12 items-center justify-center rounded-xl bg-muted/50 p-1.5 backdrop-blur-sm border border-border/50 shadow-inner", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger outside Tabs");
  const active = ctx.value === value;
  return (
    <button
      type="button"
      onClick={() => ctx.setValue(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-6 py-2 text-sm font-semibold transition-all duration-300",
        active 
          ? "bg-background text-foreground shadow-sm ring-1 ring-border" 
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent outside Tabs");
  if (ctx.value !== value) return null;
  return <div className={cn("mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out", className)}>{children}</div>;
}
