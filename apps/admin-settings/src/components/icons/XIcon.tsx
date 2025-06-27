import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const XIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <path
      d="M18 6 6 18"
      stroke={props.stroke || 'currentColor'}
      strokeWidth={props.strokeWidth || 1.5}
      strokeLinecap="square"
      fill={props.fill || 'transparent'}
    />
    <path
      d="m6 6 12 12"
      stroke={props.stroke || 'currentColor'}
      strokeWidth={props.strokeWidth || 1.5}
      strokeLinecap="square"
      fill={props.fill || 'transparent'}
    />
  </BaseIcon>
));

export default XIcon;
