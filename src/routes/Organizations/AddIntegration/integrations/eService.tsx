import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useId } from 'react';
import type { ReactNode } from 'react';
import type { Control } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormComponent } from '@core/components/FormComponent';
import WizardStepWrapper from '@core/components/Wizard/WizardStepWrapper';
import { type OrgAndSubUnitDTO } from '@generated/core/data-contracts';

import { EServiceOwnerType } from '../../enums';
import type { AddIntegrationFormData } from '../AddIntegrationSchema';
import { MIAlert } from '@pagopa/mui-italia/components/MIAlert';
import { getPdndClientsByOrgSubUnitCode } from '@core/api/integrations';

type eServiceIntegrationProps = {
  control: Control<AddIntegrationFormData>;
  subUnits?: Array<OrgAndSubUnitDTO>;
  organizationId: number;
};

const GENERAL_INFO_TEXT_FIELDS = ['eServiceName', 'purposeId'] as const;

const FieldGroup = ({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) => {
  const titleId = useId();

  return (
    <Box
      role="group"
      aria-labelledby={titleId}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}
    >
      <Typography id={titleId} variant="subtitle2" mb={2}>
        {title}
      </Typography>
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
};

export const EServiceIntegration = ({
  control,
  subUnits,
  organizationId
}: eServiceIntegrationProps) => {
  const { t } = useTranslation();
  const ownerType = useWatch({ control, name: 'E_SERVICE.ownerType' });
  const isSubUnitOwner = ownerType === EServiceOwnerType.SUB_UNIT;
  //const hasNoSubUnits = isSubUnitOwner && subUnits?.length === 0;
  const { data: pdndClients } = getPdndClientsByOrgSubUnitCode(organizationId);

  const clientsLength = pdndClients?.length ?? 0;

  return (
    <>
      <WizardStepWrapper
        title={t('integrations.add.eService.owner.title')}
        subtitle={t('integrations.add.eService.owner.description')}
        sx={{ marginTop: 2 }}
      >
        <FormComponent.ControlledRadioGroup
          name="E_SERVICE.ownerType"
          aria-label={t('integrations.add.eService.owner.title')}
          control={control}
          row
          sx={{ gap: 3 }}
          showErrorMessage={false}
          options={[
            {
              value: EServiceOwnerType.ORGANIZATION,
              label: t('integrations.add.eService.owner.organization')
            },
            {
              value: EServiceOwnerType.SUB_UNIT,
              label: t('integrations.add.eService.owner.subUnit')
            }
          ]}
        />
        {isSubUnitOwner && (
          <FormComponent.ControlledSelect
            name="E_SERVICE.subUnitCode"
            control={control}
            label={t('integrations.add.eService.fields.subUnit')}
            options={(subUnits ?? []).map(
              ({ subUnitCode, subUnitName = '' }) => ({
                value: subUnitCode,
                label: subUnitName
              })
            )}
            required
          />
        )}
        {
          !clientsLength ? (
            <Box mt={2}>
              <MIAlert
                severity="error"
                title={t(
                  `integrations.add.eService.errors.noClients.${ownerType}.title`,
                )}
              >
                {t(`integrations.add.eService.errors.noClients.${ownerType}.message`)}
              </MIAlert>
          </Box>
          ):
          null
        }
      </WizardStepWrapper>

      {clientsLength ? (
        <WizardStepWrapper
          title={t('integrations.add.eService.configure.title')}
          subtitle={t('integrations.add.eService.configure.description')}
          sx={{ marginTop: 2 }}
        >
          <Stack spacing={2}>
            <FieldGroup title={t('integrations.add.eService.generalInfo')}>
              {GENERAL_INFO_TEXT_FIELDS.map((name) => (
                <FormComponent.ControlledTextField
                  key={name}
                  name={`E_SERVICE.${name}`}
                  control={control}
                  label={t(`integrations.add.eService.fields.${name}`)}
                  required
                />
              ))}
              <FormComponent.ControlledSelect
                name="E_SERVICE.clientId"
                control={control}
                label={t('integrations.add.eService.fields.clientId')}
                options={(pdndClients ?? []).map(
                  ({ clientId, clientName = '' }) => ({
                    value: clientId,
                    label: clientName
                  })
                )}
                required
              />
            </FieldGroup>
          </Stack>
        </WizardStepWrapper>
      ) : null}
    </>
  );
};
