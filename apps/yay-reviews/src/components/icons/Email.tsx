import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const EmailIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_4482_4270)">
      <path
        d="M2 8.86914C2 9.56914 2.37 10.2191 2.97 10.5791L10.46 15.0691C11.41 15.6391 12.6 15.6391 13.55 15.0691L21.04 10.5791C21.64 10.2191 22.01 9.56914 22.01 8.86914"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M18 4H6C3.8 4 2 5.8 2 8V16C2 18.2 3.8 20 6 20H18C20.2 20 22 18.2 22 16V8C22 5.8 20.2 4 18 4Z"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
    </g>
    <defs>
      <clipPath id="clip0_4482_4270">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default EmailIcon;
