import {
  OrganizationDetail,
  OrganizationStatus
} from '../../../../generated/core/data-contracts';
import { DetailData } from '../../../components/DetailContainer/DetailContainer';
import { Box, ChipOwnProps, Divider, Stack, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import Appio from '../../../assets/appio.svg';
import Send from '../../../assets/send.svg';
import ShowSecretValue from '../../../components/ShowSecretValue';
import LaunchIcon from '@mui/icons-material/Launch';
import { generatePath, Link } from 'react-router';
import { PageRoutes } from '../..';

const organizationStatusColors: Record<
  OrganizationStatus,
  ChipOwnProps['color']
> = {
  [OrganizationStatus.ACTIVE]: 'success',
  [OrganizationStatus.DRAFT]: 'default',
  [OrganizationStatus.CANCELLED]: 'error'
};

const getOrganizationStatusValue = (status: OrganizationStatus): string => {
  const statusValueMap: Record<OrganizationStatus, string> = {
    [OrganizationStatus.ACTIVE]: 'ENABLED',
    [OrganizationStatus.DRAFT]: 'DRAFT',
    [OrganizationStatus.CANCELLED]: 'CANCELLED'
  };
  return statusValueMap[status];
};

export const accountingInfo = (
  organizationDetailData: OrganizationDetail,
  t: TFunction
): Array<DetailData> => [
  {
    label: t('commons.iban'),
    value: organizationDetailData?.iban
  },
  {
    label: t('commons.postIban'),
    value: organizationDetailData?.postalIban
  },
  {
    label: t('commons.cbill'),
    value: organizationDetailData?.cbillInterBankCode
  },
  {
    label: t('commons.cashJournal'),
    value: organizationDetailData?.flagTreasury
      ? t('commons.enabled')
      : t('commons.disabled')
  }
];
export const paymentInfo = (
  organizationDetailData: OrganizationDetail,
  t: TFunction,
  displayNames: Intl.DisplayNames
): Array<DetailData> => [
  {
    label: t('commons.segregationCode'),
    value: organizationDetailData?.segregationCode
  },
  {
    label: t('commons.additionalLanguage'),
    value:
      organizationDetailData.additionalLanguage &&
      displayNames.of(organizationDetailData?.additionalLanguage)
  },
  {
    label: t('organizations.paymentPushNotification'),
    value: organizationDetailData?.flagNotifyOutcomePush
      ? t('commons.enabled')
      : t('commons.disabled')
  },
  {
    label: t('organizations.paymentNotified'),
    value: organizationDetailData?.flagPaymentNotification
      ? t('commons.enabled')
      : t('commons.disabled')
  },
  {
    childrenComponent: (
      <ShowSecretValue
        label={t('organizations.printKeyAPI')}
        secretValue={organizationDetailData.generateNoticeApiKey}
      />
    )
  }
];

export const info = (
  organizationDetailData: OrganizationDetail,
  t: TFunction
): Array<DetailData> => {
  const out: Array<DetailData> = [
    {
      label: t('commons.state'),
      value: getOrganizationStatusValue(organizationDetailData?.status),
      valueType: 'status',
      chipConfig: {
        color: organizationStatusColors[organizationDetailData?.status]
      }
    },
    {
      label: t('commons.ipaCode'),
      value: organizationDetailData?.ipaCode
    },
    {
      label: t('commons.fiscalCode'),
      value: organizationDetailData?.orgFiscalCode
    },
    {
      label: t('commons.organizationType'),
      value: organizationDetailData?.orgTypeCode
    },
    {
      label: t('organizations.orgEmail'),
      value: organizationDetailData?.orgEmail
    },
    {
      childrenComponent: <Divider></Divider>
    }
  ];

  const active_info: Array<DetailData> = [
    {
      label: t('commons.operators'),
      value: organizationDetailData?.operatorsCount,
      valueType: 'withicon',
      iconConfig: {
        icon: (
          <Link
            to={generatePath(PageRoutes.BROKER_OPERATORS, {
              organizationId: organizationDetailData.organizationId,
              orgName: organizationDetailData.orgName
            })}
            target={'_blank'}
          >
            <LaunchIcon color={'primary'} />
          </Link>
        )
      }
    },
    {
      label: t('commons.debtTypes'),
      value: organizationDetailData?.debtPositionTypeOrgCount,
      valueType: 'withicon',
      iconConfig: {
        icon: (
          <Link
            to={generatePath(PageRoutes.DEBT_TYPES_DASHBOARD_BYORG, {
              organizationId: organizationDetailData.organizationId
            })}
            target={'_blank'}
          >
            <LaunchIcon color={'primary'} />
          </Link>
        )
      }
    }
  ];

  if (organizationDetailData?.status === OrganizationStatus.ACTIVE) {
    out.push(...active_info);
  }

  return out;
};

export const integrationBox = (
  organizationDetailData: OrganizationDetail,
  t: TFunction
): Array<DetailData> => [
  {
    childrenComponent: (
      <Stack direction={'row'} alignItems={'center'}>
        <Box width={40} aria-hidden="true">
          <Appio />
        </Box>
        <Typography px={2} variant="body2" fontWeight={600} component={'span'}>
          IO
        </Typography>
      </Stack>
    )
  },
  {
    label: t('organizations.ioMessagge'),
    value: organizationDetailData?.flagNotifyIo
      ? t('commons.enabled')
      : t('commons.disabled')
  },
  {
    childrenComponent: (
      <ShowSecretValue
        label={t('commons.apiKey')}
        secretValue={organizationDetailData.ioApiKey}
      />
    )
  },
  {
    childrenComponent: <Divider></Divider>
  },
  {
    childrenComponent: (
      <Stack direction={'row'} alignItems={'center'}>
        <Box width={40} aria-hidden="true">
          <Send />
        </Box>
        <Typography px={2} variant="body2" fontWeight={600} component={'span'}>
          SEND
        </Typography>
      </Stack>
    )
  },
  {
    label: t('organizations.pdndIntegration'),
    value: organizationDetailData?.pdndEnabled
      ? t('commons.enabled')
      : t('commons.disabled')
  },
  {
    childrenComponent: (
      <ShowSecretValue
        label={t('commons.apiKey')}
        secretValue={organizationDetailData.sendApiKey}
      />
    )
  }
];
