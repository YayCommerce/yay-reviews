import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const EmailIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_4482_9742)">
      <path
        d="M17.56 3.66992H6.44C3.98786 3.66992 2 5.65778 2 8.10992V15.8999C2 18.3521 3.98786 20.3399 6.44 20.3399H17.56C20.0121 20.3399 22 18.3521 22 15.8999V8.10992C22 5.65778 20.0121 3.66992 17.56 3.66992Z"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M6.44043 8.6499L11.1104 10.6899C11.6704 10.9399 12.3104 10.9399 12.8804 10.6899L17.5504 8.6699"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
    </g>
    <defs>
      <clipPath id="clip0_4482_9742">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default EmailIcon;
