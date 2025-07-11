import { useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { createRoot } from 'react-dom/client';

import CustomRichTextColor from './custom-rich-text-color';

import './index.scss';

import { updateEmailPreview } from '@/lib/utils';

const RichTextEditor = ({
  ID,
  value,
  handleOnChange,
}: {
  ID: string;
  value: string;
  handleOnChange: (content: string) => void;
}) => {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    window.wp.editor.initialize(ID, {
      tinymce: {
        toolbar1:
          'undo redo bold italic underline fontsizeselect fontweight customforecolor alignleft aligncenter alignright alignjustify',
        forced_root_block: 'div',
        menubar: false,
        directionality: 'ltr',
        formats: {
          fontweight: { inline: 'span', styles: { 'font-weight': '%value' } },
        },
        fontsize_formats:
          '8px 9px 10px 11px 12px 13px 14px 15px 16px 18px 20px 24px 30px 36px 40px',
        /** Set default font-side */
        content_style: `body {
            font-size: 14px;
            font-family: "Helvetica Neue",Helvetica,Roboto,Arial,sans-serif ;
          }
          p {
            margin: 0px;
          }`,
        setup: (editor: any) => {
          editor.on('keyup ExecCommand change', () => {
            handleOnChange(editor.getContent());
            updateEmailPreview(
              editor.getContent(),
              'content',
              ID === 'yay-reviews-email-content-reminder'
                ? 'reminder'
                : ID === 'yay-reviews-email-content-reward'
                  ? 'reward'
                  : '',
            );
          });
          editor.addButton('customforecolor', {
            id: `yay-reviews-editor-custom-fore-color_${ID}`,
            tooltip: __('Text color', 'yay-reviews'),
          });
          editor.addButton('fontweight', {
            id: `yay-reviews-editor-font-weight_${ID}`,
            tooltip: __('Font Weight', 'yay-reviews'),
            type: 'listbox',
            text: __('Font Weight', 'yay-reviews'),
            values: [
              { text: __('Light (300)', 'yay-reviews'), value: '300' },
              { text: __('Normal (400)', 'yay-reviews'), value: '400' },
              { text: __('Medium (500)', 'yay-reviews'), value: '500' },
              { text: __('Semi Bold (600)', 'yay-reviews'), value: '600' },
              { text: __('Bold (700)', 'yay-reviews'), value: '700' },
              { text: __('Extra Bold (800)', 'yay-reviews'), value: '800' },
            ],
            onselect: (e: any) => {
              editor.formatter.apply('fontweight', { value: e.control.value() });
              handleOnChange(editor.getContent());
              updateEmailPreview(
                editor.getContent(),
                'content',
                ID === 'yay-reviews-email-content-reminder'
                  ? 'reminder'
                  : ID === 'yay-reviews-email-content-reward'
                    ? 'reward'
                    : '',
              );
            },
          });

          timeoutId = setTimeout(() => {
            const renderCustomColorPicker = (containerId: string, component: JSX.Element) => {
              const container = document.getElementById(containerId);
              if (container) {
                const root = createRoot(container);
                root.render(component);
              }
            };
            if (ID) {
              renderCustomColorPicker(
                `yay-reviews-editor-custom-fore-color_${ID}`,
                <CustomRichTextColor
                  colorType="ForeColor"
                  initialValue="#0F172A"
                  editorId={ID}
                  onChange={(e) => {
                    handleOnChange(e);
                    updateEmailPreview(
                      e,
                      'content',
                      ID === 'yay-reviews-email-content-reminder'
                        ? 'reminder'
                        : ID === 'yay-reviews-email-content-reward'
                          ? 'reward'
                          : '',
                    );
                  }}
                />,
              );
            }
          }, 100);
        },
      },
    });
    return () => {
      window.wp.editor.remove(ID);
      clearTimeout(timeoutId);
    };
  }, [handleOnChange, ID]);

  return (
    <div className="yay-reviews-editor" key={ID}>
      <textarea id={ID} defaultValue={value} style={{ fontSize: '14px' }} />
    </div>
  );
};

export default RichTextEditor;
