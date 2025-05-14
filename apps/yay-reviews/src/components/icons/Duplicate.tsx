import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const DuplicateIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_4482_11000)">
      <path
        d="M2 19.7798C2 21.0098 2.99 21.9998 4.22 21.9998"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M2 16.4399V13.1099"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M4.22 7.56006C2.99 7.56006 2 8.55006 2 9.78006"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M14.2197 21.9998C15.4497 21.9998 16.4397 21.0098 16.4397 19.7798"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.8896 22H7.55957"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M14.2198 7.56006C15.4498 7.56006 16.4398 8.55006 16.4398 9.78006V16.4501H9.7698C8.5398 16.4501 7.5498 15.4601 7.5498 14.2301V7.56006H14.2198Z"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M7.55957 7.55977V4.22977C7.55957 2.99977 8.54957 2.00977 9.77957 2.00977H19.7796C21.0096 2.00977 21.9996 2.99977 21.9996 4.22977V14.2198C21.9996 15.4498 21.0096 16.4398 19.7796 16.4398H16.4496"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
    </g>
    <defs>
      <clipPath id="clip0_4482_11000">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default DuplicateIcon;
