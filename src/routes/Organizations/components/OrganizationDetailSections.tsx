import { OrganizationDetailDTO } from '../../../../generated/data-contracts';
import { DetailData } from '../../../components/DetailContainer/DetailContainer';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import Appio from '../../../assets/appio.svg';
import Send from '../../../assets/send.svg';
import ShowSecretValue from '../../../components/ShowSecretValue';

export const accountingInfo = (
  organizationDetailData: OrganizationDetailDTO,
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
  organizationDetailData: OrganizationDetailDTO,
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
  organizationDetailData: OrganizationDetailDTO,
  t: TFunction
): Array<DetailData> => [
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
  },
  {
    label: t('commons.operators'),
    value: '0'
  },
  {
    label: t('commons.debtTypes'),
    value: '0'
  }
];

export const integrationBox = (
  organizationDetailData: OrganizationDetailDTO,
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
