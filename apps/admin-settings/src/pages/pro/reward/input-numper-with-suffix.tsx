import { useState } from 'react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const suffixOptions = [
  {
    label: window.yayReviews.currency_symbol,
    value: 'currency',
  },
  {
    label: '%',
    value: 'percentage',
  },
];

export const InputNumberWithSuffix = ({
  name,
  width,
  suffix,
  value,
  onChange,
  onSuffixChange,
}: {
  name: string;
  width?: string;
  suffix: string;
  value: number;
  onChange: (value: number) => void;
  onSuffixChange: (suffix: string) => void;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSuffixChange = (suffix: string) => {
    if (suffix === 'percentage' && Number(value) > 100) {
      onChange(100);
    }
    onSuffixChange(suffix);
  };

  return (
    <div className="relative flex h-[34px] flex-col items-start gap-2.5">
      <div
        className={cn(
          'relative flex flex-1 items-center justify-between self-stretch overflow-hidden rounded-md border border-solid border-gray-200 bg-white transition-[color,box-shadow]',
          width,
          (isFocused || isOpen) && 'border-ring! ring-ring/50! ring-[3px]!',
        )}
      >
        <Input
          id={name}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="yayrev-input-number-with-suffix flex-1 border-0! bg-transparent px-3 py-2 pr-[4px]! text-sm font-normal text-gray-400 focus-visible:ring-0! focus-visible:outline-none!"
          min={0}
          max={suffix === 'percentage' ? 100 : undefined}
        />

        <div className="relative inline-flex flex-[0_0_auto] items-center justify-end">
          <Select
            value={suffix}
            onValueChange={handleSuffixChange}
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            <SelectTrigger className="h-[34px] w-fit rounded-l-none rounded-r-md border-r-[0px] border-l border-gray-200 bg-gray-50 hover:bg-gray-100 focus:ring-0 focus:outline-none [&_svg]:hidden">
              <SelectValue className="text-center" />
            </SelectTrigger>
            <SelectContent className="z-[1000]">
              {suffixOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default InputNumberWithSuffix;
