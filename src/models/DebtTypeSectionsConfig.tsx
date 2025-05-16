import {
  DetailData,
  titleConfig
} from '../components/DetailContainer/DetailContainer';
import PreviewIcon from '@mui/icons-material/Preview';
import { DebtPositionTypeOrg } from '../../generated/apiClient';
import Button from '@mui/material/Button';

export enum AccordionSectionsEnum {
  MAIN_CONFIGURATION = 'MAIN_CONFIGURATION',
  DEBT_CONFIGURATION = 'DEBT_CONFIGURATION',
  ACCOUNTING = 'ACCOUNTING',
  MESSAGES = 'MESSAGES',
  ENABLED_OPERATORS = 'ENABLED_OPERATORS'
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
  data: DebtPositionTypeOrg,
  t: (key: string) => string
): Array<AccordionSectionConfig> => {
  return [
    {
      configType: AccordionSectionsEnum.MAIN_CONFIGURATION,
      title: t('debtTypeDetail.debtMainConfiguration.title'),
      description: t('debtTypeDetail.debtMainConfiguration.description'),
      sections: [
        {
          title: { label: t('commons.description'), variant: 'subtitle1' },
          data: [
            {
              label: t('commons.debtTypeName'),
              value: checkStringValue(data?.description)
            }
          ]
        },
        {
          title: {
            label: t('debtTypeCreateEC.configuration.debtTypeVersion.title'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('debtTypeCreateEC.configuration.code.label'),
              value: checkStringValue(data?.code)
            },
            {
              label: t('commons.description'),
              value: checkStringValue(data?.description)
            }
          ]
        },
        {
          title: {
            label: t('debtTypeCreateEC.configuration.selection.title'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('commons.paymentManager'),
              value: checkStringValue(data?.orgSector)
            }
          ]
        }
      ]
    },
    {
      configType: AccordionSectionsEnum.DEBT_CONFIGURATION,
      title: t('debtTypeCreateEC.behaviour.title'),
      description: t('debtTypeCreateEC.behaviour.subtitle'),
      sections: [
        {
          data: [
            {
              label: t('debtTypeCreateEC.behaviour.postalAccount'),
              value: data?.flagSpontaneous ? t('commons.yes') : t('commons.no')
            }
          ]
        },
        {
          title: {
            label: t('debtTypeCreate.settings.behaviour'),
            variant: 'subtitle1'
          },
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
          title: {
            label: t('debtTypeCreateEC.behaviour.notifications.title'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('commons.notifications'),
              value: t(getFlagLabel(data?.flagNotifyOutcomePush))
            }
          ]
        },
        {
          title: {
            label: t('debtTypeCreateEC.behaviour.updateAmount.title'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('debtTypeCreateEC.behaviour.updateAmount.notesLabel'),
              value: '-'
            },
            {
              label: t('debtTypeCreateEC.behaviour.updateAmount.amountLabel'),
              value: '-'
            },
            {
              label: t('debtTypeCreateEC.behaviour.updateAmount.authUrlLabel'),
              value: '-'
            },
            {
              label: t(
                'debtTypeCreateEC.behaviour.updateAmount.updateUrlLabel'
              ),
              value: '-'
            }
          ]
        }
      ]
    },
    {
      configType: AccordionSectionsEnum.ACCOUNTING,
      title: t('debtTypeCreateEC.accounting.title'),
      description: t('debtTypeDetail.accounting.description'),
      sections: [
        {
          title: {
            label: t('debtTypeCreateEC.accounting.section.creditInfo'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('debtTypeCreateEC.accounting.postalIban'),
              value: t(checkStringValue(data?.postalIban))
            },
            {
              label: t('debtTypeCreateEC.accounting.pspIban'),
              value: t(checkStringValue(data?.iban))
            },
            {
              label: t('debtTypeCreateEC.accounting.postalAccount'),
              value: t(checkStringValue(data?.postalAccountCode))
            },
            {
              label: t('debtTypeCreateEC.accounting.postalAccountHolder'),
              value: t(checkStringValue(data?.holderPostalCc))
            }
          ]
        },
        {
          title: {
            label: t('debtTypeCreateEC.accounting.section.budgetInfo'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('debtTypeCreateEC.accounting.defaultBudgetStructure'),
              value: '-'
            },
            {
              label: t('debtTypeCreateEC.accounting.entitySector'),
              value: checkStringValue(data?.orgSector)
            }
          ]
        }
      ]
    },
    {
      configType: AccordionSectionsEnum.MESSAGES,
      title: t('debtTypeCreateEC.notifications.title'),
      description: t('debtTypeDetail.messages.description'),
      sections: [
        {
          title: {
            label: t('debtTypeDetail.messages.IOApp'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('debtTypeDetail.messages.sendMessage'),
              value: t(getFlagLabel(data?.flagNotifyIo))
            },
            {
              label: t('debtTypeDetail.messages.APIKey'),
              value: t(checkStringValue(data?.serviceId))
            },
            {
              label: t('debtTypeCreateEC.notifications.messageSubject.label'),
              value: t(checkStringValue(data?.ioTemplateSubject))
            },
            {
              label: t('commons.message'),
              value: '',
              childrenComponent: (
                <Button
                  variant="text"
                  size="small"
                  startIcon={<PreviewIcon />}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    paddingLeft: 0,
                    alignItems: 'center'
                  }}
                >
                  {t('debtTypeCreate.settings.preview')}
                </Button>
              )
            }
          ]
        }
      ]
    },
    {
      configType: AccordionSectionsEnum.ENABLED_OPERATORS,
      title: t('debtTypesCreated.myOrganizationDataGrid.enabledOperators'),
      description: t('debtTypeDetail.enabledOperators.title'),
      sections: [
        {
          title: {
            label: t(
              'debtTypesCreated.myOrganizationDataGrid.enabledOperators'
            ),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('debtTypeDetail.enabledOperators.noSelectedOperators'),
              value: '-'
            }
          ]
        }
      ]
    }
  ];
};
