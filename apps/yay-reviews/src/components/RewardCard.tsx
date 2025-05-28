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

export default function RewardCard({
  item,
  setActiveTab,
}: {
  item: {
    id: number;
    name: string;
    status: 'active' | 'inactive';
  };
  setActiveTab: (tab: string) => void;
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
          {/* Coupon selection */}
          <div className="flex flex-col gap-2">
            <span className="text-sm">{__('select_coupon_to_be_sent')}</span>
            <div>
              <Select>
                <SelectTrigger className="w-1/2 bg-white">
                  <SelectValue placeholder={__('select_coupon')} />
                </SelectTrigger>
                <SelectContent>{/* ...options... */}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-xs">
            <span className="text-slate-500">{__('change')}</span>
            {` `}
            <span
              className="cursor-pointer lowercase underline decoration-solid"
              onClick={() => {
                setActiveTab('emails');
              }}
            >
              {__('email_template')}
            </span>
          </div>
          <hr className="text-[#E5E7EB]" />
          {/* Review criteria */}
          <div className="flex flex-col gap-2">
            <div className="text-foreground mb-2 text-lg font-semibold">
              {__('review_criteria')}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Switch />
              <span>{__('only_send_coupon_for_reviews_from_purchased_customers')}</span>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <Switch />
              <span className="text-muted-foreground">{__('guests_can_receive_reward')}</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">{__('minimum_required_rating')}</label>
              <Input type="number" className="w-16" value={3} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">{__('minimum_media_files_uploaded')}</label>
              <Input type="number" className="w-16" value={1} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">{__('minimum_required_reviews')}</label>
              <Input type="number" className="w-16" value={1} />
              <span className="text-[#64748B]">
                {__('leave_empty_to_receive_reward_after_every_review')}
              </span>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
