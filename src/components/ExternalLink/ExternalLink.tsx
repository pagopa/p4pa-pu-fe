import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { ReactNode } from 'react';
import { forwardRef } from 'react';

import Link from '@mui/material/Link';
import type LinkProps from '@mui/material/LinkProps';

type ExternalLinkProps = Omit<LinkProps, 'target' | 'rel'> & {
  children?: ReactNode;
};

const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(
  ({ children, sx, ...props }, ref) => (
    <Link
      ref={ref}
      target="_blank"
      rel="noopener noreferrer"
      underline="none"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        fontWeight: 600,
        ...sx
      }}
      {...props}
    >
      {children}
      <OpenInNewIcon fontSize="small" />
    </Link>
  )
);

ExternalLink.displayName = 'ExternalLink';

export default ExternalLink;
