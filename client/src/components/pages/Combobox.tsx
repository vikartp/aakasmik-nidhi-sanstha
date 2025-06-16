import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Make Combobox generic for value type
export interface ComboboxOption<T> {
  value: T;
  label: string;
  selected: boolean;
}

export function Combobox<T>({
  frameworks,
  frameType,
  onValueChange,
}: {
  frameworks: ComboboxOption<T>[];
  frameType: string;
  onValueChange: (value: T) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState<T | undefined>(
    frameworks.find(f => f.selected)?.value
  );

  const handleChange = (currentValue: T) => {
    setValue(currentValue === value ? undefined : currentValue);
    onValueChange(currentValue); // Notify parent
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value !== undefined
            ? frameworks.find(framework => framework.value === value)?.label
            : (frameworks.find(f => f.selected)?.label ??
              `Select ${frameType}`)}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search ..." className="h-9" />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {frameworks.map(framework => (
                <CommandItem
                  key={String(framework.value)}
                  value={String(framework.value)}
                  onSelect={() => {
                    handleChange(framework.value);
                    setOpen(false);
                  }}
                >
                  {framework.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === framework.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
