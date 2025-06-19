import { SVGProps } from 'react';

export const QuestionIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M6 8.75a6 6 0 1 1 7.692 5.758C12.375 14.895 11 16.048 11 17.75v1a1 1 0 1 0 2 0v-1c0-.506.452-1.087 1.255-1.323A8 8 0 1 0 4 8.75a1 1 0 0 0 2 0Zm7.5 14.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
      clipRule="evenodd"
    />
  </svg>
);
