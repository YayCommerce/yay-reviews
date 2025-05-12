import { forwardRef } from 'react';

export type BaseIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

/**
 * Base Component for Bookster Icons
 */
const BaseIcon = forwardRef<SVGSVGElement, BaseIconProps>(function BaseIcon(
  { children, className = '', size = 16, viewBox = '0 0 16 16', ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`yay-reviews-icon ${className}`}
      {...props}
    >
      {children}
    </svg>
  );
});

export default BaseIcon;
