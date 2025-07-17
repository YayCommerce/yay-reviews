import { __ } from '@wordpress/i18n';

import useAppContext from '@/hooks/use-app-context';
import { Button } from '@/components/ui/button';

import { WizardContent, WizardHeader } from '.';

export default function FinishStep() {
  const { finishWizard } = useAppContext();
  return (
    <WizardContent className="text-center w-full py-4">
      <WizardHeader
        title={__('You’re ready to collect reviews! 🎉', 'yay-reviews')}
        className="text-center"
      />
      <div className="text-center">
        {__('We’ll handle the tech. You focus on selling.', 'yay-reviews')}
      </div>
      <Button className="mt-2" onClick={() => finishWizard()}>
        {__('View dashboard', 'yay-reviews')}
      </Button>
    </WizardContent>
  );
}
