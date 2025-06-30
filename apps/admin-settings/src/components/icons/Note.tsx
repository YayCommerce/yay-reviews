import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const NoteIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_3111_12540)">
      <path
        d="M8.05 4.55L7.08 4.78C6.39 4.94 5.85 5.48 5.69 6.17L5.46 7.14C5.44 7.24 5.29 7.24 5.26 7.14L5.03 6.17C4.87 5.48 4.33 4.94 3.64 4.78L2.67 4.55C2.57 4.53 2.57 4.38 2.67 4.35L3.64 4.12C4.33 3.96 4.87 3.42 5.03 2.73L5.26 1.76C5.28 1.66 5.43 1.66 5.46 1.76L5.69 2.73C5.85 3.42 6.39 3.96 7.08 4.12L8.05 4.35C8.15 4.37 8.15 4.52 8.05 4.55Z"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeMiterlimit="10"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M7.31001 14.26H12.34"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M7.31001 10.24H15.35"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M10.33 2.20001H16.36C19.71 2.38001 21.39 3.62001 21.39 8.22001V16.27"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M3.29001 9.25V16.26C3.29001 20.29 4.30001 22.31 9.32001 22.31H15.35"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
      <path
        d="M21.39 16.27L15.36 22.3V19.28C15.36 17.27 16.37 16.26 18.38 16.26H21.4L21.39 16.27Z"
        stroke={props.stroke || 'currentColor'}
        strokeWidth={props.strokeWidth || 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={props.fill || 'transparent'}
      />
    </g>
    <defs>
      <clipPath id="clip0_3111_12540">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default NoteIcon;
