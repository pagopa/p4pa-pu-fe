import { Link, LinkProps } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { forwardRef, ReactNode } from 'react';

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
