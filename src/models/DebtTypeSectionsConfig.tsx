import {
  DetailData,
  titleConfig
} from '../components/DetailContainer/DetailContainer';
import { DebtPositionTypeOrgDTO } from '../../generated/apiClient';
import { moneyFormat } from '../utils/formatters';
import { AppPreview } from '../components/AppPreview';

export enum AccordionSectionsEnum {
  MAIN_CONFIGURATION = 'MAIN_CONFIGURATION',
  DEBT_CONFIGURATION = 'DEBT_CONFIGURATION',
  ACCOUNTING = 'ACCOUNTING',
  MESSAGES = 'MESSAGES',
  ENABLED_OPERATORS = 'ENABLED_OPERATORS'
}

export type OperatorsData = {
  totalOperators: number;
  enabledOperators: number;
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

const getFlagLabel = (value: boolean | undefined): string => {
  if (value === undefined) return '-';
  return value ? 'commons.enabled' : 'commons.disabled';
};

const checkStringValue = (value: string | undefined): string => {
  return value ?? '-';
};

const getEnabledOperatorsLabelAndValue = (
  operators: OperatorsData,
  t: (key: string) => string
): { label: string; value: string } => {
  const { totalOperators, enabledOperators } = operators;

  if (enabledOperators === 0) {
    return {
      label: t('debtTypeDetail.enabledOperators.noSelectedOperators'),
      value: '-'
    };
  }

  if (totalOperators === enabledOperators) {
    return {
      label: t('debtTypeDetail.enabledOperators.allOperatorsSelected'),
      value: `${enabledOperators} ${enabledOperators === 1 ? t('commons.operator') : t('commons.operators')}`
    };
  }

  if (totalOperators > enabledOperators) {
    return {
      label: t('debtTypeDetail.enabledOperators.selectedOperators'),
      value: `${enabledOperators} ${enabledOperators === 1 ? t('commons.operator') : t('commons.operators')}`
    };
  }

  return { label: '', value: '' };
};

export const getAccordionSectionsConfig = (
  data: DebtPositionTypeOrgDTO,
  operators: OperatorsData | null,
  t: (key: string) => string
): Array<AccordionSectionConfig> => {
  const buildSpontaneousModeDetails = (
    debtType: DebtPositionTypeOrgDTO
  ): Array<DetailData> => {
    // Show details only when spontaneous payments are enabled
    if (!debtType.flagSpontaneous) {
      return [];
    }

    const details: Array<DetailData> = [];

    // Standard mode: no custom form and no external URL
    const hasCustomForm =
      debtType.spontaneousFormId != null || !!debtType.spontaneousFormCode;
    const hasExternalUrl = !!debtType.externalPaymentUrl;

    if (hasCustomForm) {
      // Custom form / prefilled data
      details.push(
        {
          label: t('debtTypeOrgCreate.behaviour.spontaneousMode.label'),
          value: t('debtTypeOrgCreate.behaviour.spontaneousMode.options.custom')
        },
        {
          label: t('debtTypeOrgCreate.behaviour.customForms.select.label'),
          value: checkStringValue(debtType.spontaneousFormCode)
        }
      );
    } else if (hasExternalUrl) {
      // External portal
      details.push(
        {
          label: t('debtTypeOrgCreate.behaviour.spontaneousMode.label'),
          value: t(
            'debtTypeOrgCreate.behaviour.spontaneousMode.options.external'
          )
        },
        {
          label: t('debtTypeDetail.debtConfiguration.externalPaymentUrl'),
          value: checkStringValue(debtType.externalPaymentUrl)
        }
      );
    } else {
      // Standard system data
      details.push({
        label: t('debtTypeOrgCreate.behaviour.spontaneousMode.label'),
        value: t('debtTypeOrgCreate.behaviour.spontaneousMode.options.standard')
      });
    }

    return details;
  };

  const sections: Array<AccordionSectionConfig> = [
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
            },
            {
              label: t('debtTypeOrgCreate.configuration.taxonomyCode.label'),
              value: checkStringValue(data?.debtPositionTypeTaxonomyCode)
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
              value: checkStringValue(data?.debtPositionTypeDescription)
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
          title: {
            label: t('debtTypeOrgCreate.behaviour.characteristics.title'),
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
            },
            {
              label: t('debtTypeOrgCreate.behaviour.presetAmount.label'),
              value: t(
                getFlagLabel(
                  (data as { flagPresetAmount?: boolean }).flagPresetAmount ??
                    data?.amountCents != null
                )
              )
            },
            ...(((data as { flagPresetAmount?: boolean }).flagPresetAmount ??
              data?.amountCents != null) &&
            data?.amountCents != null
              ? [
                  {
                    label: t(
                      'debtTypeOrgCreate.behaviour.spontaneous.amountValue.label'
                    ),
                    value: moneyFormat(data.amountCents)
                  }
                ]
              : []),
            {
              label: t('debtTypeOrgCreate.behaviour.postalAccount'),
              value: t(getFlagLabel(data?.flagSpontaneous))
            },
            ...buildSpontaneousModeDetails(data)
          ]
        },
        {
          title: {
            label: t('debtTypeOrgCreate.behaviour.updateAmount.title'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('commons.notificationsConfig'),
              value: checkStringValue(
                data?.amountActualizationOrgSilServiceApplicationName
              )
            }
          ]
        },
        {
          title: {
            label: t('debtTypeOrgCreate.behaviour.notifications.title'),
            variant: 'subtitle1'
          },
          data: [
            {
              label: t('commons.notifications'),
              value: t(getFlagLabel(data?.flagNotifyOutcomePush))
            },
            {
              label: t('commons.notificationsConfig'),
              value: checkStringValue(
                data?.notifyOutcomePushOrgSilServiceApplicationName
              )
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

  if (operators) {
    const operatorInfo = getEnabledOperatorsLabelAndValue(operators, t);

    sections.push({
      configType: AccordionSectionsEnum.ENABLED_OPERATORS,
      title: t('debtTypeDetail.enabledOperators.title'),
      description: t('debtTypeDetail.enabledOperators.description'),
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
              label: operatorInfo.label,
              value: operatorInfo.value
            }
          ]
        }
      ]
    });
  }

  return sections;
};
