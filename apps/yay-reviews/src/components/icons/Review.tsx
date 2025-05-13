import { forwardRef } from 'react';

import BaseIcon, { BaseIconProps } from './BaseIcon';

const ReviewIcon = forwardRef<SVGSVGElement, BaseIconProps>(({ ...props }, ref) => (
  <BaseIcon ref={ref} {...props}>
    <g clipPath="url(#clip0_4482_13604)">
      <path
        d="M3.80985 17.7404C0.839853 13.4904 1.59985 7.67042 5.56985 4.34042C9.53985 1.01042 15.3999 1.26042 19.0699 4.93042C22.7399 8.60042 22.9899 14.4604 19.6599 18.4304C16.3299 22.4004 10.5099 23.1704 6.25985 20.1904L3.10985 20.8904L3.80985 17.7404Z"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
      <path
        d="M11.0798 7.76043C11.2498 7.41043 11.6098 7.19043 11.9998 7.19043C12.3898 7.19043 12.7498 7.41043 12.9198 7.76043L13.5498 9.04043C13.6998 9.34043 13.9898 9.55043 14.3198 9.60043L15.7298 9.81043C16.1198 9.87043 16.4398 10.1404 16.5598 10.5104C16.6798 10.8804 16.5798 11.2904 16.2998 11.5604L15.2798 12.5604C15.0398 12.8004 14.9298 13.1404 14.9898 13.4704L15.2298 14.8804C15.2998 15.2704 15.1398 15.6504 14.8198 15.8804C14.4998 16.1104 14.0798 16.1404 13.7398 15.9604L12.4698 15.3004C12.1698 15.1404 11.8098 15.1404 11.5198 15.3004L10.2498 15.9604C9.89982 16.1404 9.48982 16.1104 9.16982 15.8804C8.84982 15.6504 8.69982 15.2604 8.75982 14.8804L8.99982 13.4704C9.05982 13.1404 8.94982 12.8004 8.70982 12.5604L7.68982 11.5604C7.40982 11.2904 7.30982 10.8804 7.42982 10.5104C7.54982 10.1404 7.86982 9.87043 8.25982 9.81043L9.66982 9.60043C9.99982 9.55043 10.2898 9.34043 10.4398 9.04043L11.0698 7.76043H11.0798Z"
        stroke="currentColor"
        strokeWidth={props.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="transparent"
      />
    </g>
    <defs>
      <clipPath id="clip0_4482_13604">
        <rect width={props.size || 24} height={props.size || 24} fill="currentColor" />
      </clipPath>
    </defs>
  </BaseIcon>
));

export default ReviewIcon;
