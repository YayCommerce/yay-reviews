import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const HomeIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_4482_3494)">
      <path
        d="M9 17H15"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M3.43994 7.25977V17.9998C3.43994 20.2098 5.22994 21.9998 7.43994 21.9998H16.6799C18.8899 21.9998 20.6799 20.2098 20.6799 17.9998V7.25977"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
      <path
        d="M1 8.86984L10.52 2.50984C11.55 1.81984 12.89 1.83984 13.9 2.53984L23 8.86984"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
    </g>
    <defs>
      <clipPath id="clip0_4482_3494">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default HomeIcon;
