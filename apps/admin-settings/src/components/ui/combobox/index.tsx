import { useCallback, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { debounce } from 'lodash';
import { CheckIcon, ChevronsUpDown, Loader2 } from 'lucide-react';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface ComboboxOption {
  label: string;
  value: string | number;
}

export interface ComboboxProps {
  placeholder?: string;
  searchPlaceholder?: string;
  options: ComboboxOption[];
  value: ComboboxOption[];
  onChange: (values: ComboboxOption[]) => void;
  className?: string;
  hasAll?: boolean;
  disabled?: boolean;
  onSearch?: (search: string) => void;
  id?: string;
}

function Combobox({
  placeholder = __('Select values', 'yay-customer-reviews-woocommerce'),
  searchPlaceholder = __('Search value', 'yay-customer-reviews-woocommerce'),
  options,
  value,
  onChange,
  className,
  hasAll = false,
  disabled = false,
  onSearch,
  id,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce the search function
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      if (onSearch) {
        setIsLoading(true);
        onSearch(search);
        // Reset loading state after a short delay to ensure smooth UX
        setTimeout(() => setIsLoading(false), 300);
      }
    }, 500),
    [onSearch],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
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
          {value.length > 0
            ? value
                .map((item) => item.label)
                .slice(0, 2)
                .join(', ') + (value.length > 2 ? '...' : '')
            : placeholder}
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder || __('Search value', 'yay-customer-reviews-woocommerce')}
            onValueChange={debouncedSearch}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <CommandEmpty>{__('No value found', 'yay-customer-reviews-woocommerce')}</CommandEmpty>
                <CommandGroup>
                  {hasAll && (
                    <CommandItem
                      key="select-all"
                      value={__('All', 'yay-customer-reviews-woocommerce')}
                      onSelect={() => {
                        onChange(options);
                      }}
                    >
                      <div
                        className="border-input data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground pointer-events-none size-4 shrink-0 rounded-[4px] border transition-all select-none *:[svg]:opacity-0 data-[selected=true]:*:[svg]:opacity-100"
                        data-selected={value.length === options.length}
                      >
                        <CheckIcon className="size-3.5 text-current" />
                      </div>
                      {__('All', 'yay-customer-reviews-woocommerce')}
                    </CommandItem>
                  )}
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={`${option.value}-${option.label}`}
                      onSelect={() => {
                        const isChecked = value.some((item) => item.value === option.value);
                        if (isChecked) {
                          onChange(value.filter((item) => item.value !== option.value));
                        } else {
                          onChange([...value, option]);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <div
                        className="border-input data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground pointer-events-none size-4 shrink-0 rounded-[4px] border transition-all select-none *:[svg]:opacity-0 data-[selected=true]:*:[svg]:opacity-100"
                        data-selected={value.some((item) => item.value === option.value)}
                      >
                        <CheckIcon className="size-3.5 text-current" />
                      </div>
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default Combobox;
