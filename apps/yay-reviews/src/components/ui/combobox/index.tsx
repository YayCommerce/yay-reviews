import { useState } from 'react';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';

import { __, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface ComboboxProps {
  placeholder?: string;
  searchPlaceholder?: string;
  options: {
    label: string;
    value: string;
  }[];
  value: string[];
  onChange: (values: string[]) => void;
  className?: string;
  hasAll?: boolean;
  disabled?: boolean;
}

function Combobox({
  placeholder,
  searchPlaceholder,
  options,
  value,
  onChange,
  className,
  hasAll = false,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-fit min-w-[280px] justify-between',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
          disabled={disabled}
        >
          {hasAll && value.length > 0
            ? value.length === options.length
              ? __('all')
              : value
                  .map((value) => options.find((option) => option.value === value)?.label)
                  .join(', ')
            : placeholder || __('select_values')}
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder || __('search_value')} />
          <CommandList>
            <CommandEmpty>{__('no_value_found')}</CommandEmpty>
            <CommandGroup>
              {hasAll && (
                <CommandItem
                  key="select-all"
                  value={__('all')}
                  onSelect={() => {
                    onChange(options.map((option) => option.value));
                  }}
                >
                  <div
                    className="border-input data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground pointer-events-none size-4 shrink-0 rounded-[4px] border transition-all select-none *:[svg]:opacity-0 data-[selected=true]:*:[svg]:opacity-100"
                    data-selected={value.length === options.length}
                  >
                    <CheckIcon className="size-3.5 text-current" />
                  </div>
                  {__('all')}
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.value}-${option.label}`}
                  onSelect={() => {
                    const isChecked = value.some((f) => f === option.value);
                    if (isChecked) {
                      onChange(value.filter((f) => f !== option.value));
                    } else {
                      onChange([...value, option.value]);
                    }
                  }}
                >
                  <div
                    className="border-input data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground pointer-events-none size-4 shrink-0 rounded-[4px] border transition-all select-none *:[svg]:opacity-0 data-[selected=true]:*:[svg]:opacity-100"
                    data-selected={value.some((f) => f === option.value)}
                  >
                    <CheckIcon className="size-3.5 text-current" />
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default Combobox;
