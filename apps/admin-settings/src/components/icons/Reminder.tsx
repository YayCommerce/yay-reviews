import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const ReminderIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_4482_8263)">
      <path
        d="M14.2193 20.89C13.6893 21.59 12.8693 22 11.9993 22C11.1293 22 10.2993 21.59 9.7793 20.89"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M18.6597 11.71C18.6597 12.24 18.8697 12.75 19.2497 13.13L20.0797 13.96C20.6397 14.52 20.9897 15.31 20.8697 16.1C20.6897 17.3 19.6697 18.13 18.5197 18.13H5.64965C4.84965 18.13 4.04965 17.81 3.57965 17.17C2.86965 16.19 2.99965 14.89 3.75965 14.13L4.70965 13.18C5.07965 12.81 5.28965 12.31 5.29965 11.79L5.32965 8.69002C5.32965 5.01002 8.31965 2.02002 11.9997 2.02002C15.1197 2.02002 18.0097 4.20002 18.6297 7.72002"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
    </g>
    <defs>
      <clipPath id="clip0_4482_8263">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default ReminderIcon;
