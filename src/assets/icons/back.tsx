import { SVGProps } from 'react';

export const BackIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={25}
    fill="none"
    {...props}
  >
    <path
      fill="#2B2E38"
      fillRule="evenodd"
      d="M11.293 24.457a1 1 0 0 0 1.414-1.414L3.414 13.75H23a1 1 0 1 0 0-2H3.414l9.293-9.293a1 1 0 0 0-1.414-1.414l-11 11a1 1 0 0 0 0 1.414l11 11Z"
      clipRule="evenodd"
    />
  </svg>
);
