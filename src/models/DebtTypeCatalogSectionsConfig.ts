import { useTranslation } from 'react-i18next';
import {
  DetailData,
  titleConfig
} from '../components/DetailContainer/DetailContainer';

export enum AccordionSectionsEnum {
  DEBT_CATALOG_CONFIGURATION = 'DEBT_CATALOG_CONFIGURATION',
  ADDITIONAL_SETTINGS = 'ADDITIONAL_SETTINGS'
}

export type DebtTypeCatalogDetail = {
  debtPositionTypeId: number;
  code: string;
  description: string;
  organizationTypeDescription: string;
  macroAreaName: string;
  serviceType: string;
  collectionReason: string;
  taxonomyCode: string;
  flagAnonymousFiscalCode: boolean;
  flagMandatoryDueDate: boolean;
  flagNotifyIo: boolean;
  ioTemplateMessage: string;
};

export type AccordionSectionConfig = {
  configType: AccordionSectionsEnum;
  title: string;
  description: string;
  sections: Array<{
    title?: titleConfig;
    data: Array<DetailData>;
    inline?: boolean;
  }>;
};

const getFlagLabel = (value: boolean): string =>
  value ? 'Abilitato' : 'Disabilitato';

export const accordionSectionsConfig = (
  data: DebtTypeCatalogDetail
): Array<AccordionSectionConfig> => {
  const { t } = useTranslation();

  return [
    {
      configType: AccordionSectionsEnum.DEBT_CATALOG_CONFIGURATION,
      title: t('debtTypeCatalogDetail.debtCatalogConfiguration.title'),
      description: t(
        'debtTypeCatalogDetail.debtCatalogConfiguration.description'
      ),
      sections: [
        {
          title: { label: t('commons.description'), variant: 'subtitle1' },
          data: [
            {
              label: t('commons.debtTypeCode'),
              value: data?.code
            },
            {
              label: t('commons.debtTypeName'),
              value: data?.description
            }
          ]
        },
        {
          title: { label: t('commons.taxonomy'), variant: 'subtitle1' },
          data: [
            {
              label: t('commons.organizationType'),
              value: data?.organizationTypeDescription
            },
            {
              label: t('commons.macroarea'),
              value: data?.macroAreaName
            },
            {
              label: t('commons.serviceType'),
              value: data?.serviceType
            },
            {
              label: t('commons.collectionReason'),
              value: data?.collectionReason
            },
            {
              label: t('commons.taxCode'),
              value: data?.taxonomyCode
            }
          ]
        }
      ]
    },

    {
      configType: AccordionSectionsEnum.ADDITIONAL_SETTINGS,
      title: t('debtTypeCatalogDetail.additionalSettings.title'),
      description: t('debtTypeCatalogDetail.additionalSettings.description'),
      sections: [
        {
          title: { label: t('commons.behavior'), variant: 'subtitle1' },
          data: [
            {
              label: t('commons.mandatoryDueDate'),
              value: getFlagLabel(data?.flagMandatoryDueDate)
            },
            {
              label: t('commons.anonymousFiscalCode'),
              value: getFlagLabel(data?.flagAnonymousFiscalCode)
            },
            { label: t('commons.voluntaryPayment'), value: 'Abilitato' }
          ]
        },
        {
          title: { label: t('commons.messages'), variant: 'subtitle1' },
          data: [
            {
              label: t('debtTypeCatalogDetail.IOAppMessageTemplate'),
              value: getFlagLabel(data?.flagNotifyIo)
            },
            {
              label: t('commons.subject'),
              value:
                'Il servizio ti invia comunicazioni in merito alla Tassa sui rifiuti (TARI).'
            },
            {
              label: t('commons.message'),
              value: data?.ioTemplateMessage
            }
          ]
        }
      ]
    }
  ];
};
