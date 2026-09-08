import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Divider, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router';

import { OrganizationDetail } from '../../../../generated/core/data-contracts';
import { PageRoutes } from '@core/routes';

type RowProps = {
  label: string;
  value?: React.ReactNode;
};

const Row = ({ label, value }: RowProps) => (
  <Stack>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value || '-'}
    </Typography>
  </Stack>
);

type LinkRowProps = {
  label: string;
  value?: React.ReactNode;
  linkLabel: string;
  to: string;
};

const LinkRow = ({ label, value = '-', linkLabel, to }: LinkRowProps) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Row label={label} value={value} />
    <Link to={to} target="_blank" style={{ textDecoration: 'none' }}>
      <Stack direction="row" alignItems="center" gap={0.5}>
        <Typography variant="body2" fontWeight={600} color="primary">
          {linkLabel}
        </Typography>
        <ArrowForwardIcon color="primary" fontSize="small" />
      </Stack>
    </Link>
  </Stack>
);

export const SectionCard = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
    <Stack gap={2}>
      <Typography
        sx={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '14px' }}
      >
        {title}
      </Typography>
      <Stack gap={1.5} divider={<Divider />}>
        {children}
      </Stack>
    </Stack>
  </Paper>
);

type InfoProps = { organizationDetailData: OrganizationDetail };

export const Registry = ({ organizationDetailData }: InfoProps) => {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('organizations.registry.title')}>
      <Row
        label={t('commons.ipaCode')}
        value={organizationDetailData?.ipaCode}
      />
      <Row
        label={t('commons.fiscalCode')}
        value={organizationDetailData?.orgFiscalCode}
      />
      <Row
        label={t('commons.organizationType')}
        value={organizationDetailData?.orgTypeDescription}
      />
      <Row
        label={t('organizations.orgEmail')}
        value={organizationDetailData?.orgEmail}
      />
    </SectionCard>
  );
};

export const Management = ({
  organizationDetailData: {
    debtPositionTypeOrgCount,
    operatorsCount,
    orgName,
    organizationId
  }
}: InfoProps) => {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('organizations.management.title')}>
      <LinkRow
        label={t('organizations.management.debtTypes')}
        value={debtPositionTypeOrgCount}
        linkLabel={t('organizations.management.debtTypesLink')}
        to={generatePath(PageRoutes.DEBT_TYPES_DASHBOARD_BYORG, {
          organizationId
        })}
      />
      <LinkRow
        label={t('organizations.management.operators')}
        value={operatorsCount}
        linkLabel={t('organizations.management.operatorsLink')}
        to={generatePath(PageRoutes.BROKER_OPERATORS, {
          organizationId,
          orgName
        })}
      />
      {/* TODO: add route when available */}
      {/* <LinkRow */}
      {/*   label={t('organizations.management.subUnits')} */}
      {/*   value={organizationDetailData?.orgTypeCode} */}
      {/*   linkLabel={t('organizations.management.subUnitsLink')} */}
      {/*   to="" */}
      {/* /> */}
    </SectionCard>
  );
};

export const Accounting = ({ organizationDetailData }: InfoProps) => {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('commons.accountingInformation')}>
      <Row label={t('commons.iban')} value={organizationDetailData?.iban} />
      <Row
        label={t('commons.postIban')}
        value={organizationDetailData?.postalIban}
      />
      <Row
        label={t('commons.cbill')}
        value={organizationDetailData?.cbillInterBankCode}
      />
      <Row
        label={t('commons.cashJournal')}
        value={
          organizationDetailData?.flagTreasury
            ? t('commons.enabled')
            : t('commons.disabled')
        }
      />
    </SectionCard>
  );
};

type PaymentInfoProps = InfoProps & { displayNames: Intl.DisplayNames };

export const Payment = ({
  organizationDetailData,
  displayNames
}: PaymentInfoProps) => {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('commons.payments')}>
      <Row
        label={t('commons.segregationCode')}
        value={organizationDetailData?.segregationCode}
      />
      <Row
        label={t('commons.additionalLanguage')}
        value={
          organizationDetailData.additionalLanguage &&
          displayNames.of(organizationDetailData?.additionalLanguage)
        }
      />
      <Row
        label={t('organizations.paymentPushNotification')}
        value={
          organizationDetailData?.flagNotifyOutcomePush
            ? t('commons.enabled')
            : t('commons.disabled')
        }
      />
      <Row
        label={t('organizations.paymentNotified')}
        value={
          organizationDetailData?.flagPaymentNotification
            ? t('commons.enabled')
            : t('commons.disabled')
        }
      />
    </SectionCard>
  );
};
