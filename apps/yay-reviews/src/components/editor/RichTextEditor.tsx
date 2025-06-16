import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import { __ } from '@/lib/utils';

import CustomRichTextColor from './CustomRichTextColor';

import './index.scss';

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
          });
          editor.addButton('customforecolor', {
            id: `yay-reviews-editor-custom-fore-color_${ID}`,
            tooltip: __('Text color'),
          });
          editor.addButton('fontweight', {
            id: `yay-reviews-editor-font-weight_${ID}`,
            tooltip: __('Font Weight'),
            type: 'listbox',
            text: __('Font Weight'),
            values: [
              { text: 'Light (300)', value: '300' },
              { text: 'Normal (400)', value: '400' },
              { text: 'Medium (500)', value: '500' },
              { text: 'Semi Bold (600)', value: '600' },
              { text: 'Bold (700)', value: '700' },
              { text: 'Extra Bold (800)', value: '800' },
            ],
            onselect: (e: any) => {
              editor.execCommand('mceApplyStyle', false, { 'font-weight': e.control.value() });
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
                  onChange={handleOnChange}
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
    <div className="yay-reviews-editor-property yay-reviews-editor-property-rich-text" key={ID}>
      <textarea id={ID} defaultValue={value} style={{ fontSize: '14px' }} />
    </div>
  );
};

export default RichTextEditor;
