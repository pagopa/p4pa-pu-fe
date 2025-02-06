import { Stack, Box, Container, Link } from '@mui/material';

import {
  LangSwitchProps,
  LangSwitch,
  FooterLegal,
  FooterLinksType,
  CompanyLinkType as MuiCompanyLinkType
} from '@pagopa/mui-italia';
import { LinksType } from '../../models/Links';

export type CompanyLinkType = MuiCompanyLinkType & {
  image?: React.ReactNode;
};

type FooterProps = LangSwitchProps & {
  companyLink: CompanyLinkType;
  links: Array<FooterLinksType>;
  legalInfo: JSX.Element | Array<JSX.Element>;
};

export const Footer = ({
  companyLink,
  links,
  legalInfo,
  ...langProps
}: FooterProps): JSX.Element => (
  <Box component="footer">
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper'
      }}>
      <Container maxWidth={false} sx={{ py: { xs: 3, md: 2 } }}>
        <Stack
          spacing={{ xs: 4, md: 3 }}
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          sx={{ alignItems: 'center' }}>
          <Link
            aria-label={companyLink?.ariaLabel}
            href={companyLink?.href ?? LinksType.NO_OP}
            onClick={companyLink.onClick}
            sx={{ display: 'inline-flex' }}>
            {companyLink.image}
          </Link>
          <Stack
            spacing={{ xs: 1, md: 3 }}
            direction={{ xs: 'column', md: 'row' }}
            sx={{ alignItems: 'center' }}>
            {links.map(({ href = LinksType.NO_OP, label, ariaLabel, onClick }, i) => (
              <Link
                aria-label={ariaLabel}
                href={href}
                onClick={onClick}
                key={i}
                underline="none"
                color="text.primary"
                sx={{ display: 'inline-block' }}
                variant="subtitle2">
                {label}
              </Link>
            ))}

            <LangSwitch {...langProps} />
          </Stack>
        </Stack>
      </Container>
    </Box>
    <FooterLegal content={legalInfo} />
  </Box>
);
