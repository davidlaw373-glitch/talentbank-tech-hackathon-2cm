import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Lightweight shadcn-compatible Select over a native <select>.
 *
 * Because <option> elements must live inside a <select>, SelectItems
 * register themselves into a shared context array that SelectTrigger
 * renders. This keeps the public API source-compatible with the existing
 * call sites without pulling in @radix-ui/react-select.
 *
 * Keyboard / AT support comes from the native control.
 *
 * Per AGENTS.md: no new dependencies, no extra styling.
 */
type Option = { value: string; label: string };

type SelectContextValue = {
  value: string;
  onValueChange: (next: string) => void;
  options: Option[];
  registerOption: (option: Option) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(component: string) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error(`${component} must be used inside <Select />`);
  }
  return ctx;
}

type SelectProps = {
  value: string;
  onValueChange: (next: string) => void;
  children: React.ReactNode;
};

function SelectRoot({ value, onValueChange, children }: SelectProps) {
  const [options, setOptions] = React.useState<Option[]>([]);

  const registerOption = React.useCallback((next: Option) => {
    setOptions((current) => {
      const existing = current.find((o) => o.value === next.value);
      if (existing) {
        if (existing.label === next.label) return current;
        return current.map((o) => (o.value === next.value ? next : o));
      }
      return [...current, next];
    });
  }, []);

  const ctx = React.useMemo(
    () => ({ value, onValueChange, options, registerOption }),
    [value, onValueChange, options, registerOption],
  );

  return (
    <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>
  );
}

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, options } = useSelectContext("SelectValue");
  const match = options.find((o) => o.value === value);
  return (
    <span className={match ? "" : "text-muted-foreground"}>
      {match?.label ?? placeholder ?? ""}
    </span>
  );
};

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
};

function SelectItem({ value, children }: SelectItemProps) {
  const { registerOption } = useSelectContext("SelectItem");
  const label = typeof children === "string" ? children : String(value);
  React.useEffect(() => {
    registerOption({ value, label });
  }, [registerOption, value, label]);
  return null;
}

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

type SelectTriggerProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children?: React.ReactNode;
};

const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectTriggerProps>(
  ({ className, ...props }, ref) => {
    const { value, onValueChange, options } = useSelectContext("SelectTrigger");
    return (
      <div className="relative">
        <select
          ref={ref}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            "border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring bg-card h-11 w-full appearance-none rounded-md border-2 px-3 py-2 pr-10 text-base shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground"
        />
      </div>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

const Select = Object.assign(SelectRoot, { Root: SelectRoot });
const SelectGroup = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const SelectLabel = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const SelectSeparator = () => null;
const SelectScrollUpButton = () => null;
const SelectScrollDownButton = () => null;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
