import { useState } from 'react';

import { __ } from '@/lib/utils';

import InboxIcon from '../icons/Inbox';
import OptionalFieldCard from '../OptionalFieldCard';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

type OptionalField = {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  is_required: boolean;
  description: string;
  type: 'text' | 'textarea' | 'dropdown' | 'rating' | 'checkbox';
  values: string;
};

export default function OptionalFieldTab() {
  const [fields, setFields] = useState<OptionalField[]>([]);

  const handleCreateNewField = () => {
    setFields([
      ...fields,
      {
        id: fields.length + 1,
        name: 'New Field',
        status: 'active',
        is_required: false,
        description: '',
        type: 'text',
        values: '',
      },
    ]);
  };
  return (
    <div className="flex w-2/3 flex-col gap-8">
      <div className="text-foreground text-3xl font-bold">{__('optional_fields')}</div>
      <div className="flex flex-col gap-4">
        {/* No fields added */}
        {fields.length === 0 && (
          <Card className="items-center gap-2 pt-6 pb-4 text-center">
            <CardContent className="p-0">
              <div className="flex flex-col items-center gap-2 pb-4">
                <InboxIcon strokeWidth={1} size={100} />
                <div className="px-6 text-lg font-semibold">{__('no_field_added')}</div>
                <div className="text-muted-foreground px-6 pb-4 text-sm leading-5 font-normal">
                  {__('no_field_added_description_first')}
                  <br />
                  {__('no_field_added_description_second')}
                </div>
                <Button className="w-fit gap-2" onClick={handleCreateNewField}>
                  {__('create_new')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* List of Optional Field added */}
        {fields.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-foreground text-lg font-semibold">
                  {__('you_have')} {fields.length} {__('field_set')}
                </div>
                <Button variant="outline" onClick={handleCreateNewField}>
                  {__('add_new')}
                </Button>
              </div>
              {fields.map((item) => (
                <OptionalFieldCard key={item.id} item={item} />
              ))}
              <Button
                className="w-fit self-center"
                variant="outline"
                onClick={handleCreateNewField}
              >
                {__('add_new')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
