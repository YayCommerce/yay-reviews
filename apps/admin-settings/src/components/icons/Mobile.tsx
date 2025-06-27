import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const MobileIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_4482_313)">
      <path
        d="M15.5 22H8.5C6.03 22 4 19.98 4 17.5V6.5C4 4.03 6.03 2 8.5 2H15.5C17.98 2 20 4.03 20 6.5V17.5C20 19.98 17.98 22 15.5 22Z"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M10 6H14"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M11.9902 18H12.0102"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
    </g>
    <defs>
      <clipPath id="clip0_4482_313">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default MobileIcon;
