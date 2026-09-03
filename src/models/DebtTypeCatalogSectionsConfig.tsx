import {
  DetailData,
  titleConfig
} from '../components/DetailContainer/DetailContainer';
import { DebtPositionTypeDetailDTO } from '../../generated/core/client';
import { AppPreview } from '../components/AppPreview';

export enum AccordionSectionsEnum {
  DEBT_CATALOG_CONFIGURATION = 'DEBT_CATALOG_CONFIGURATION',
  ADDITIONAL_SETTINGS = 'ADDITIONAL_SETTINGS'
}

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

const getFlagLabel = (value: boolean | undefined): string => {
  if (value === undefined) return '-';
  return value ? 'commons.enabled' : 'commons.disabled';
};

const checkStringValue = (value: string | undefined): string => {
  return value ?? '-';
};

export const getAccordionSectionsConfig = (
  data: DebtPositionTypeDetailDTO,
  t: (key: string) => string
): Array<AccordionSectionConfig> => {
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
              value: checkStringValue(data?.code)
            },
            {
              label: t('commons.debtTypeName'),
              value: checkStringValue(data?.description)
            }
          ]
        },
        {
          title: { label: t('commons.taxonomy'), variant: 'subtitle1' },
          data: [
            {
              label: t('commons.organizationType'),
              value: checkStringValue(data?.orgType)
            },
            {
              label: t('commons.macroarea'),
              value: checkStringValue(data?.macroArea)
            },
            {
              label: t('commons.serviceType'),
              value: checkStringValue(data?.serviceType)
            },
            {
              label: t('commons.collectionReason'),
              value: checkStringValue(data?.collectingReason)
            },
            {
              label: t('commons.taxCode'),
              value: checkStringValue(data?.taxonomyCode)
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
              value: t(getFlagLabel(data?.flagMandatoryDueDate))
            },
            {
              label: t('commons.anonymousFiscalCode'),
              value: t(getFlagLabel(data?.flagAnonymousFiscalCode))
            }
          ]
        },
        {
          title: { label: t('commons.messages'), variant: 'subtitle1' },
          data: [
            {
              label: t('debtTypeCatalogDetail.IOAppMessageTemplate'),
              value: t(getFlagLabel(data?.flagNotifyIo))
            },
            {
              label: t('commons.subject'),
              value: checkStringValue(data?.ioTemplateSubject)
            },
            {
              label: t('commons.message'),
              value: checkStringValue(data?.ioTemplateMessage),
              childrenComponent: (
                <AppPreview
                  subject={data.ioTemplateSubject}
                  message={data.ioTemplateMessage}
                />
              )
            }
          ]
        }
      ]
    }
  ];
};
