import { SVGProps } from 'react';

export const ReceiptIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={25}
    fill="none"
    {...props}
  >
    <path
      fill="#0E0F13"
      fillRule="evenodd"
      d="M0 5.75a3 3 0 0 1 3-3h18a3 3 0 0 1 3 3v2a3.001 3.001 0 0 1-2 2.83v9.17a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5v-9.17a3.001 3.001 0 0 1-2-2.83v-2Zm4 5h16v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-9Zm18-3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2Zm-13 5a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z"
      clipRule="evenodd"
    />
  </svg>
);
