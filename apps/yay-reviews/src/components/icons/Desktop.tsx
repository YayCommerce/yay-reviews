import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const DesktopIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_3111_11390)">
      <path
        d="M22.3866 6.52078L20.9396 6.85553C19.903 7.0931 19.0931 7.90298 18.8555 8.93963L18.5208 10.3866C18.4884 10.5378 18.2616 10.5378 18.2292 10.3866L17.8945 8.93963C17.6569 7.90298 16.847 7.0931 15.8104 6.85553L14.3634 6.52078C14.2122 6.48838 14.2122 6.26162 14.3634 6.22922L15.8104 5.89447C16.847 5.6569 17.6569 4.84702 17.8945 3.81037L18.2292 2.36338C18.2616 2.21221 18.4884 2.21221 18.5208 2.36338L18.8555 3.81037C19.0931 4.84702 19.903 5.6569 20.9396 5.89447L22.3866 6.22922C22.5378 6.26162 22.5378 6.48838 22.3866 6.52078Z"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeMiterlimit="10"
      />
      <path
        d="M22 13.11V13.55C22 15.76 20.21 17.55 18 17.55H6C3.79 17.55 2 15.76 2 13.55V6C2 3.79 3.79 2 6 2H12.56"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M12 22V17.56"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M15.89 22H8.11"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
    </g>
    <defs>
      <clipPath id="clip0_3111_11390">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default DesktopIcon;
