'use client';

import { useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Loader2Icon, Menu } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import useAddonStatus from '@/hooks/use-addon-status';
import useAppContext from '@/hooks/use-app-context';
import useWindow from '@/hooks/use-window';
import { Button } from '@/components/ui/button';

import EmailIcon from './icons/Email';
import EmailQueueIcon from './icons/EmailQueue';
import GiftIcon from './icons/Gift';
import HomeIcon from './icons/Home';
import ReminderIcon from './icons/Reminder';
import ReviewIcon from './icons/Review';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export default function Nav() {
  const { activeTab, changeTab } = useAppContext();

  const [isOpen, setIsOpen] = useState(false);

  const {
    formState: { isSubmitting, isDirty },
    watch,
  } = useFormContext();

  const { isReminderEnabled, isRewardEnabled } = useAddonStatus();

  const menuItems = useMemo(() => {
    const result = [
      {
        label: __('Dashboard', 'yay-reviews'),
        icon: <HomeIcon strokeWidth={2} />,
        key: 'dashboard',
      },
      {
        label: __('Review', 'yay-reviews'),
        icon: <ReviewIcon strokeWidth={2} />,
        key: 'review',
      },
    ];

    if (isReminderEnabled) {
      result.push({
        label: __('Reminder', 'yay-reviews'),
        icon: <ReminderIcon strokeWidth={2} />,
        key: 'reminder',
      });
    }

    if (isRewardEnabled) {
      result.push({
        label: __('Rewards', 'yay-reviews'),
        icon: <GiftIcon strokeWidth={2} />,
        key: 'reward',
      });
    }

    if (isReminderEnabled || isRewardEnabled) {
      result.push(
        {
          label: __('Emails', 'yay-reviews'),
          icon: <EmailIcon strokeWidth={2} />,
          key: 'emails',
        },
        {
          label: __('Emails Queue', 'yay-reviews'),
          icon: <EmailQueueIcon strokeWidth={2} />,
          key: 'emails-queue',
        },
      );
    }

    return result;
  }, [isReminderEnabled, isRewardEnabled]);

  const isSaveDisabled = useMemo(() => {
    return isSubmitting || !isDirty;
  }, [isSubmitting, isDirty]);

  const { isScrolling } = useWindow();

  return (
    <nav
      className={cn(
        'bg-background sticky z-50 w-full transition-shadow duration-200',
        isScrolling && 'shadow-[0px_12px_24px_-20px_rgba(0,0,0,0.5)]',
        'yay-reviews-nav',
      )}
      style={{
        top: 'var(--wpadminbar-height)',
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media screen and (max-width: 600px) {
          .yay-reviews-nav {
            top: 0 !important;
          }
        }
        `,
        }}
      ></style>
      <div className="mx-auto flex h-[54px] items-center justify-between pe-6">
        <div className="flex h-full items-center gap-7">
          {/* Logo */}
          <div className="justify-left flex h-full items-center border-r border-gray-100 p-[10px]">
            <img
              src={window.yayReviews.image_url + '/yay-reviews-logo.png'}
              alt={__('Yay Reviews', 'yay-reviews')}
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-4 md:flex!">
            {/* Navigation */}
            <div className="flex flex-wrap space-x-6">
              {menuItems.map((item) => (
                <Button
                  key={item.key}
                  variant="link"
                  className={cn(
                    'flex h-[56px] items-center gap-2 rounded-none border-b-2 border-transparent p-1 text-sm! text-gray-700 hover:text-[#2271B1] hover:no-underline focus:outline-none',
                    activeTab === item.key && 'border-[#2271B1] text-[#2271B1]',
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    changeTab(item.key);
                  }}
                >
                  {item.icon}
                  <span
                    style={
                      activeTab === item.key
                        ? {
                            textShadow: '0 0 0.01px currentcolor',
                          }
                        : {}
                    }
                  >
                    {item.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="p-0 px-2">
                  <Menu className="h-5! w-5!" />
                </Button>
              </SheetTrigger>
              <SheetContent className="max-w-[200px]">
                <div
                  className="flex flex-col gap-2"
                  style={{
                    paddingTop: 'calc(var(--wpadminbar-height) + 10px)',
                  }}
                >
                  {menuItems.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className={`flex items-center justify-start gap-2 rounded-none ${
                        activeTab === item.key ? 'bg-foreground text-background' : 'text-foreground'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        changeTab(item.key);
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Save Button */}
        <Button type="submit" disabled={isSaveDisabled}>
          {isSubmitting && <Loader2Icon className="animate-spin" />}
          {__('Save', 'yay-reviews')}
        </Button>
      </div>
    </nav>
  );
}
