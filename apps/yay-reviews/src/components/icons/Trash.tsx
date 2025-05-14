import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const TrashIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_4482_7707)">
      <path
        d="M11.9999 7.56C16.9097 7.56 20.8899 6.31535 20.8899 4.78C20.8899 3.24465 16.9097 2 11.9999 2C7.09005 2 3.10986 3.24465 3.10986 4.78C3.10986 6.31535 7.09005 7.56 11.9999 7.56Z"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M20.8799 4.92004C20.8799 4.92004 19.5699 14.42 18.9599 18.77C18.7799 20.15 17.7399 21.27 16.3799 21.57C13.4899 22.15 10.5199 22.15 7.62988 21.57C6.26988 21.27 5.22988 20.15 5.04988 18.77C4.44988 14.42 3.12988 4.92004 3.12988 4.92004"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M14.2198 18.5601C12.7398 18.7001 11.2498 18.7001 9.77979 18.5601"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
    </g>
    <defs>
      <clipPath id="clip0_4482_7707">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default TrashIcon;
