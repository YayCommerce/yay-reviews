import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const DesktopIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clip-path="url(#clip0_4418_10065)">
      <path
        d="M3 22H21"
        stroke="#1d2327"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5.59998 8.38086H4C3.45 8.38086 3 8.83086 3 9.38086V18.0009C3 18.5509 3.45 19.0009 4 19.0009H5.59998C6.14998 19.0009 6.59998 18.5509 6.59998 18.0009V9.38086C6.59998 8.83086 6.14998 8.38086 5.59998 8.38086Z"
        stroke="#1d2327"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12.7999 5.18945H11.2C10.65 5.18945 10.2 5.63945 10.2 6.18945V17.9995C10.2 18.5495 10.65 18.9995 11.2 18.9995H12.7999C13.3499 18.9995 13.7999 18.5495 13.7999 17.9995V6.18945C13.7999 5.63945 13.3499 5.18945 12.7999 5.18945Z"
        stroke="#1d2327"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M20 2H18.4C17.85 2 17.4 2.45 17.4 3V18C17.4 18.55 17.85 19 18.4 19H20C20.55 19 21 18.55 21 18V3C21 2.45 20.55 2 20 2Z"
        stroke="#1d2327"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_4418_10065">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default DesktopIcon;
