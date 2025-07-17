import { useEffect, useMemo } from 'react';
import PageLayout from '@/layouts/page-layout';
import WizardProvider from '@/providers/wizard-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { __ } from '@wordpress/i18n';
import { Loader2Icon } from 'lucide-react';
import { z } from 'zod';

import { cn, getImageUrl } from '@/lib/utils';
import useWizardContext from '@/hooks/use-wizard-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, useForm } from '@/components/ui/form';

import FinishStep from './finish';
import RequestReviewStep from './request-review';
import ReviewPickerStep from './review-picker';
import WelcomeStep from './welcome';

import './index.scss';

import { initAppSettings } from '@/lib/ajax';

const steps = [
  {
    title: __('Welcome to Yay Reviews', 'yay-reviews'),
    contentRender: () => <WelcomeStep />,
    action: {
      label: __('Start wizard', 'yay-reviews'),
    },
  },
  {
    title: __('Review type', 'yay-reviews'),
    contentRender: () => <ReviewPickerStep />,
    action: {
      label: __('Next step', 'yay-reviews'),
    },
  },
  {
    title: __('Request for a review', 'yay-reviews'),
    contentRender: () => <RequestReviewStep />,
    action: {
      label: __('Finish setup', 'yay-reviews'),
      isSubmit: true,
    },
  },
  {
    title: '',
    contentRender: () => <FinishStep />,
  },
];

const schema = z.object({
  review_type: z.string(),
  request_review_timing: z.string(),
});

function prefetchImages(prefetchSize = 400) {
  const imagesToPreload = [
    getImageUrl('yay-reviews-welcome-img.webp'),
    getImageUrl('yay-reviews-review-picker-img.webp'),
    getImageUrl('yay-reviews-request-img.webp'),
  ];

  imagesToPreload.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.width = prefetchSize;
  });
}

function WizardPage() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      review_type: 'media',
      request_review_timing: '5',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    prefetchImages();
  }, []);

  const { currentStep, goNext } = useWizardContext();

  const currentStepIndex = useMemo(() => {
    return currentStep + 1 >= steps.length ? steps.length - 1 : currentStep;
  }, [currentStep]);

  const maxStepIndex = useMemo(() => {
    return Math.max(steps.length - 2, 0);
  }, [steps]);

  const isStepBadgeVisible = useMemo(() => {
    return steps.length > 3;
  }, [steps]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    await initAppSettings(data);
    window.yayReviews.data_settings.addons.reminder_enabled = true;
    window.yayReviews.data_settings.reminder.delay_amount = Number(data.request_review_timing);
    window.yayReviews.data_settings.reminder.delay_unit = 'days';
    window.yayReviews.data_settings.reviews.enable_media_upload = data.review_type === 'media';
    goNext();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors, e) => {
          console.log(errors, e);
        })}
      >
        <PageLayout className="relative h-svh w-svw max-w-full p-0">
          <Card className="wizard-card absolute top-1/2 left-1/2 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 gap-4 p-4">
            {steps[currentStep]?.title && <WizardHeader title={steps[currentStep].title} />}
            {steps[currentStep]?.contentRender && steps[currentStep].contentRender()}
            {steps[currentStep]?.action && (
              <WizardFooter>
                <Badge variant="secondary" className={isStepBadgeVisible ? '' : 'opacity-0'}>
                  {currentStepIndex} / {maxStepIndex}
                </Badge>
                <Button
                  type={steps[currentStep].action.isSubmit ? 'submit' : 'button'}
                  onClick={(e) => {
                    if (!steps[currentStep]?.action?.isSubmit) {
                      e.preventDefault();
                      e.stopPropagation();
                      goNext();
                    }
                  }}
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && <Loader2Icon className="animate-spin" />}
                  {steps[currentStep].action.label}
                </Button>
              </WizardFooter>
            )}
          </Card>
        </PageLayout>
      </form>
    </Form>
  );
}

export default () => {
  return (
    <WizardProvider>
      <WizardPage />
    </WizardProvider>
  );
};

export function WizardHeader({ title, className }: { title: string; className?: string }) {
  return <div className={cn('text-foreground text-xl font-semibold', className)}>{title}</div>;
}

export function WizardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('flex items-center justify-between gap-2', className)}>{children}</div>;
}

export const WizardContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn('[&>*]:mb-4 [&>*:last-child]:mb-0', className)}>{children}</div>;
};
