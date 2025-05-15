import { __ } from '@/lib/utils';

import DuplicateIcon from './icons/Duplicate';
import TrashIcon from './icons/Trash';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export default function OptionalFieldCard({
  item,
}: {
  item: {
    id: number;
    name: string;
    description: string;
    type: 'text' | 'textarea' | 'dropdown' | 'rating' | 'checkbox';
    values: string;
    is_required: boolean;
    status: 'active' | 'inactive';
  };
}) {
  return (
    <Collapsible className="yay-reviews-collapsible">
      <CollapsibleTrigger className="yay-reviews-collapsible-trigger w-full cursor-pointer rounded-t-xl bg-white shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex w-1/2 items-center gap-2">
            <div className="flex w-full items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <Switch />
              <Input value={item.name} className="w-full" />
            </div>
          </div>
          <div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <DuplicateIcon strokeWidth={1.5} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{__('duplicate')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <TrashIcon strokeWidth={1.5} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{__('delete')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="yay-reviews-collapsible-content rounded-b-xl">
        <div className="flex flex-col gap-4 p-6">
          {/* Field Label */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-black">{__('label')}</span>
            <Input className="w-1/2 bg-white" value={item.name} />
          </div>
          {/* Field Description */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-black">{__('description')}</span>
            <Textarea rows={7} className="w-1/2" value={item.description} />
          </div>
          <div className="mb-2 flex items-center gap-2">
            <Switch checked={item.is_required} />
            <span className="lowercase">{__('is_required')}</span>
          </div>
          {/* Field Type */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-black">{__('type')}</span>
            <Select value={item.type}>
              <SelectTrigger className="w-1/2 bg-white">
                <SelectValue placeholder={__('select_type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">{__('text')}</SelectItem>
                <SelectItem value="textarea">{__('multi_line_text')}</SelectItem>
                <SelectItem value="dropdown">{__('dropdown')}</SelectItem>
                <SelectItem value="rating">{__('rating')}</SelectItem>
                <SelectItem value="checkbox">{__('multiple_choice')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Field Values */}
          {(item.type === 'text' || item.type === 'textarea') && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-black">{__('values')}</span>
              <Input className="w-1/2 bg-white" value={item.values} />
            </div>
          )}
          {(item.type === 'dropdown' || item.type === 'checkbox') && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-black">{__('values')}</span>
              <Textarea rows={7} className="w-1/2" value={item.values} />
              <span className="text-xs text-slate-500">{__('values_description')}</span>
            </div>
          )}
          {item.type === 'rating' && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-black">{__('total_starts_points')}</span>
              <Input className="w-1/2 bg-white" value={5} />
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
