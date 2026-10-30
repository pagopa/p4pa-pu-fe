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
import type { OrgSubUnit } from '@generated/core/data-contracts';

import { PdndOwnerType } from '../../enums';
import type { AddIntegrationFormData } from '../AddIntegrationSchema';
import { MIAlert } from '@pagopa/mui-italia/components/MIAlert';

type PdndClientIntegrationProps = {
  control: Control<AddIntegrationFormData>;
  organizationName: string;
  // undefined while the sub-units are not loaded
  subUnits?: Array<OrgSubUnit>;
};

const GENERAL_INFO_FIELDS = ['clientName', 'clientId', 'kid'] as const;
const CRYPTO_FIELDS = ['publicKey', 'privateKey'] as const;

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

export const PdndClientIntegration = ({
  control,
  organizationName,
  subUnits
}: PdndClientIntegrationProps) => {
  const { t } = useTranslation();
  const ownerType = useWatch({ control, name: 'PDND_CLIENT.ownerType' });
  const isSubUnitOwner = ownerType === PdndOwnerType.SUB_UNIT;
  const hasNoSubUnits = isSubUnitOwner && subUnits?.length === 0;

  return (
    <>
      <WizardStepWrapper
        title={t('integrations.add.pdndClient.owner.title')}
        subtitle={t('integrations.add.pdndClient.owner.description')}
        sx={{ marginTop: 2 }}
      >
        <FormComponent.ControlledRadioGroup
          name="PDND_CLIENT.ownerType"
          aria-label={t('integrations.add.pdndClient.owner.title')}
          control={control}
          row
          sx={{ gap: 3 }}
          showErrorMessage={false}
          options={[
            {
              value: PdndOwnerType.ORGANIZATION,
              label: t('integrations.add.pdndClient.owner.organization')
            },
            {
              value: PdndOwnerType.SUB_UNIT,
              label: t('integrations.add.pdndClient.owner.subUnit')
            }
          ]}
        />

        {isSubUnitOwner && (
          <Box mt={2}>
            {hasNoSubUnits ? (
              <MIAlert
                severity="error"
                title={t(
                  'integrations.add.pdndClient.errors.noSubUnits.title',
                  { organizationName }
                )}
              >
                {t('integrations.add.pdndClient.errors.noSubUnits.message')}
              </MIAlert>
            ) : (
              <FormComponent.ControlledSelect
                name="PDND_CLIENT.subUnitCode"
                control={control}
                label={t('integrations.add.pdndClient.subUnit')}
                options={(subUnits ?? []).map(
                  ({ subUnitCode, subUnitName }) => ({
                    value: subUnitCode,
                    label: subUnitName
                  })
                )}
                required
              />
            )}
          </Box>
        )}
      </WizardStepWrapper>

      {!hasNoSubUnits && (
        <WizardStepWrapper
          title={t('integrations.add.pdndClient.configure.title')}
          subtitle={t('integrations.add.pdndClient.configure.description')}
          sx={{ marginTop: 2 }}
        >
          <Stack spacing={2}>
            <FieldGroup title={t('integrations.add.pdndClient.generalInfo')}>
              {GENERAL_INFO_FIELDS.map((name) => (
                <FormComponent.ControlledTextField
                  key={name}
                  name={`PDND_CLIENT.${name}`}
                  control={control}
                  label={t(`integrations.add.pdndClient.fields.${name}`)}
                  required
                />
              ))}
            </FieldGroup>

            <FieldGroup title={t('integrations.add.pdndClient.cryptoMaterial')}>
              {CRYPTO_FIELDS.map((name) => (
                <FormComponent.ControlledTextField
                  key={name}
                  name={`PDND_CLIENT.${name}`}
                  control={control}
                  label={t(`integrations.add.pdndClient.fields.${name}`)}
                  multiline
                  minRows={4}
                  autoComplete="off"
                  inputProps={{ spellCheck: false }}
                  required
                />
              ))}
            </FieldGroup>
          </Stack>
        </WizardStepWrapper>
      )}
    </>
  );
};
