import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const SendIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_4418_9832)">
      <path
        d="M9.51002 4.23062L18.07 8.51062C21.91 10.4306 21.91 13.5706 18.07 15.4906L9.51002 19.7706C3.75002 22.6506 1.40002 20.2906 4.28002 14.5406L5.15002 12.8106C5.37002 12.3706 5.37002 11.6406 5.15002 11.2006L4.28002 9.46062C1.40002 3.71062 3.76002 1.35062 9.51002 4.23062Z"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M5.43994 12H10.8399"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
    </g>
    <defs>
      <clipPath id="clip0_4418_9832">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default SendIcon;
