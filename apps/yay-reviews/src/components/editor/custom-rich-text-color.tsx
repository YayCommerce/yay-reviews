import React, { MouseEventHandler, useCallback, useMemo, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';

const CustomRichTextColor = ({
  colorType,
  initialValue,
  editorId,
  onChange,
}: {
  colorType: string;
  initialValue: string;
  editorId: string;
  onChange: (content: string) => void;
}) => {
  const [color, setColor] = useState<string>(initialValue || '#000000');
  const editor = useMemo(() => window.tinymce.get(editorId), [editorId]);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleChange = (newColor: string) => {
    if (editor) {
      const newColorHex = newColor;
      setColor(newColorHex);
      editor.execCommand(colorType, false, newColorHex);
      onChange(editor.getContent());
    }
  };

  const applyCurrentColor: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.stopPropagation();
      editor.execCommand(colorType, false, color);
      onChange(editor.getContent());
    },
    [editor, color],
  );

  // Close picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker]);

  return (
    <div>
      <div className="flex items-center gap-1">
        <button
          role="presentation"
          type="button"
          onClick={applyCurrentColor}
          style={{
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            background: 'none',
            border: 'none',
            padding: 0,
            boxSizing: 'border-box',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              background: color,
              borderRadius: '6px',
              boxShadow: '0 0 0 1px #e5e7eb',
            }}
          />
        </button>

        <button type="button" className="mce-open" onClick={() => setShowPicker(!showPicker)}>
          <i className="mce-caret" />
        </button>
      </div>
      {showPicker && (
        <div ref={pickerRef} style={{ position: 'absolute', zIndex: 1000 }}>
          <SketchPicker color={color} onChangeComplete={(color) => handleChange(color.hex)} />
        </div>
      )}
    </div>
  );
};

export default CustomRichTextColor;
