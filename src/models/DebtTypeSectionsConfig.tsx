import {
  DetailData,
  titleConfig
} from '../components/DetailContainer/DetailContainer';
import PreviewIcon from '@mui/icons-material/Preview';
import { DebtPositionTypeOrgDTO } from '../../generated/apiClient';
import Button from '@mui/material/Button';
import { moneyFormat } from '../utils/formatters';

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
  data: DebtPositionTypeOrgDTO,
  t: (key: string) => string
): Array<AccordionSectionConfig> => {
  const getSpontaneousConfig = (
    data: DebtPositionTypeOrgDTO
  ): AccordionSectionConfig['sections'][number] => {
    const details: Array<DetailData> = [];

    if (
      !data?.amountCents &&
      !data?.externalPaymentUrl &&
      !data?.xsdDefinitionRef
    ) {
      details.push({
        label: t('debtTypeOrgCreate.behaviour.spontaneous.label'),
        value: t('debtTypeOrgCreate.behaviour.spontaneous.free')
      });
    }

    if (data?.amountCents) {
      details.push(
        {
          label: t('debtTypeOrgCreate.behaviour.spontaneous.label'),
          value: t('debtTypeOrgCreate.behaviour.spontaneous.amount')
        },
        {
          label: t('debtTypeOrgCreate.behaviour.spontaneous.amountValue.label'),
          value: moneyFormat(data?.amountCents)
        }
      );
    }

    if (data?.externalPaymentUrl) {
      details.push(
        {
          label: t('debtTypeOrgCreate.behaviour.spontaneous.label'),
          value: t('debtTypeOrgCreate.behaviour.spontaneous.external')
        },
        {
          label: t('debtTypeDetail.debtConfiguration.externalPaymentUrl'),
          value: checkStringValue(data?.externalPaymentUrl)
        }
      );
    }

    if (data?.xsdDefinitionRef) {
      details.push(
        {
          label: t('debtTypeOrgCreate.behaviour.spontaneous.label'),
          value: t('debtTypeOrgCreate.behaviour.spontaneous.custom')
        },
        {
          label: t('debtTypeDetail.debtConfiguration.xsdAttachment'),
          value: checkStringValue(data?.xsdDefinitionRef)
        }
      );
    }

    return {
      title: {
        label: t('debtTypeOrgCreate.behaviour.section.spontaneousPaymentTitle'),
        variant: 'subtitle1'
      },
      data: details
    };
  };
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
            label: t('debtTypeOrgCreate.configuration.debtTypeVersion.title'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('debtTypeOrgCreate.configuration.code.label'),
              value: checkStringValue(data?.code)
            },
            {
              label: t('commons.description'),
              value: checkStringValue(data?.description)
            }
          ]
        }
      ]
    },
    {
      configType: AccordionSectionsEnum.DEBT_CONFIGURATION,
      title: t('debtTypeOrgCreate.behaviour.title'),
      description: t('debtTypeOrgCreate.behaviour.subtitle'),
      sections: [
        {
          data: [
            {
              label: t('debtTypeOrgCreate.behaviour.postalAccount'),
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
        ...(data?.flagSpontaneous ? [getSpontaneousConfig(data)] : []),
        {
          title: {
            label: t('debtTypeOrgCreate.behaviour.notifications.title'),
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
            label: t('debtTypeOrgCreate.behaviour.updateAmount.title'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('debtTypeOrgCreate.behaviour.updateAmount.notesLabel'),
              value: '-'
            },
            {
              label: t('debtTypeOrgCreate.behaviour.updateAmount.amountLabel'),
              value: '-'
            },
            {
              label: t('debtTypeOrgCreate.behaviour.updateAmount.authUrlLabel'),
              value: '-'
            },
            {
              label: t(
                'debtTypeOrgCreate.behaviour.updateAmount.updateUrlLabel'
              ),
              value: '-'
            }
          ]
        }
      ]
    },
    {
      configType: AccordionSectionsEnum.ACCOUNTING,
      title: t('debtTypeOrgCreate.accounting.title'),
      description: t('debtTypeDetail.accounting.description'),
      sections: [
        {
          title: {
            label: t('debtTypeOrgCreate.accounting.section.creditInfo'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('debtTypeOrgCreate.accounting.postalIban'),
              value: checkStringValue(data?.postalIban)
            },
            {
              label: t('debtTypeOrgCreate.accounting.pspIban'),
              value: checkStringValue(data?.iban)
            },
            {
              label: t('debtTypeOrgCreate.accounting.postalAccount'),
              value: checkStringValue(data?.postalAccountCode)
            },
            {
              label: t('debtTypeOrgCreate.accounting.postalAccountHolder'),
              value: checkStringValue(data?.holderPostalCc)
            }
          ]
        },
        {
          title: {
            label: t('debtTypeOrgCreate.accounting.section.budgetInfo'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('debtTypeOrgCreate.accounting.defaultBudgetStructure'),
              value: checkStringValue(data?.balance)
            },
            {
              label: t('debtTypeOrgCreate.accounting.entitySector'),
              value: checkStringValue(data?.orgSector)
            }
          ]
        }
      ]
    },
    {
      configType: AccordionSectionsEnum.MESSAGES,
      title: t('debtTypeOrgCreate.notifications.title'),
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
              value: checkStringValue(data?.serviceId)
            },
            {
              label: t('debtTypeOrgCreate.notifications.messageSubject.label'),
              value: checkStringValue(data?.ioTemplateSubject)
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
