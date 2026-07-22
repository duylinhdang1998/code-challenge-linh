import type { SVGProps } from 'react';

export type IconName =
  | 'chevron-down'
  | 'swap'
  | 'search'
  | 'close'
  | 'check'
  | 'refresh'
  | 'spinner';

const PATHS: Record<IconName, JSX.Element> = {
  'chevron-down': (
    <path
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  swap: (
    <path
      d="M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  close: (
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  ),
  check: (
    <path
      d="m5 13 4 4L19 7"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  refresh: (
    <path
      d="M20 11a8 8 0 1 0-.9 4.5M20 5v5h-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  spinner: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 18, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      width={size}
      height={size}
      aria-hidden
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
