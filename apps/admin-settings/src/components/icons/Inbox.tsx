import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const InboxIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_4482_9752)">
      <path
        d="M7.55957 11.44V9C7.55957 7.9 8.45957 7 9.55957 7H14.4496C15.5496 7 16.4496 7.9 16.4496 9V11.44"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M10.8802 13.1099H13.1102L14.4502 11.7699C14.6602 11.5599 14.9402 11.4399 15.2402 11.4399H16.4502C17.0602 11.4399 17.5602 11.9399 17.5602 12.5499V14.9899C17.5602 16.0899 16.6602 16.9899 15.5602 16.9899H8.4502C7.3502 16.9899 6.4502 16.0899 6.4502 14.9899V12.5499C6.4502 11.9399 6.9502 11.4399 7.5602 11.4399H8.7602C9.0602 11.4399 9.3402 11.5599 9.5502 11.7699L10.8902 13.1099H10.8802Z"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
    </g>
    <defs>
      <clipPath id="clip0_4482_9752">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default InboxIcon;
