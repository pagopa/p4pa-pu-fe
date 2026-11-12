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
import { useGetPdndClientsByOrgSubUnitCode } from '@core/api/integrations';

type SubUnitOption = {
  subUnitCode: string;
  subUnitName?: string;
};

type eServiceIntegrationProps = {
  control: Control<AddIntegrationFormData>;
  orgSubUnitsWithNoServiceType?: Array<OrgAndSubUnitDTO>;
  subUnits?: Array<SubUnitOption>;
  organizationId: number;
  editMode?: boolean;
  serviceSubUnitCode?: string;
  serviceSubUnitName?: string;
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
  orgSubUnitsWithNoServiceType = [],
  subUnits = [],
  organizationId,
  editMode = false,
  serviceSubUnitCode,
  serviceSubUnitName
}: eServiceIntegrationProps) => {
  const { t } = useTranslation();
  const ownerType = useWatch({ control, name: 'E_SERVICE.ownerType' });
  const formSubUnitCode =
    useWatch({ control, name: 'E_SERVICE.subUnitCode' }) || null;
  // Fall back to the prop (loaded e-service or URL) when the form field is not
  // populated yet, so the selected sub-unit is correct on first render too.
  const subUnitCode = formSubUnitCode ?? serviceSubUnitCode ?? null;
  const isSubUnitOwner = ownerType === EServiceOwnerType.SUB_UNIT;

  const { data: pdndClients } = useGetPdndClientsByOrgSubUnitCode(
    organizationId,
    subUnitCode || undefined
  );

  const clientsLength = pdndClients?.length ?? 0;

  const canAddSendService =
    isSubUnitOwner && !subUnitCode
      ? true
      : Boolean(
          orgSubUnitsWithNoServiceType?.find(
            (subUnit) => subUnit.subUnitCode === subUnitCode
          )
        );

  let errorType: 'noClients' | 'serviceAlreadyExists' | null = null;
  if (clientsLength === 0) {
    errorType = 'noClients';
  } else if (!canAddSendService) {
    errorType = 'serviceAlreadyExists';
  }

  const ownerOptions = [
    {
      value: EServiceOwnerType.ORGANIZATION,
      label: t('integrations.add.eService.owner.organization')
    },
    {
      value: EServiceOwnerType.SUB_UNIT,
      label: t('integrations.add.eService.owner.subUnit')
    }
  ];

  // In edit mode the service can belong to any sub-unit, so the full list is
  // shown. In add mode only the sub-units without a service can be selected.
  const subUnitOptions = (
    editMode && subUnits.length > 0 ? subUnits : orgSubUnitsWithNoServiceType
  )
    .filter(({ subUnitCode }) => subUnitCode)
    .map(({ subUnitCode, subUnitName = '' }) => ({
      value: subUnitCode,
      label: subUnitName
    }));

  // The current sub-unit may not be part of the list (e.g. it already has a
  // service), so it is added back to show the selected value.
  if (
    serviceSubUnitCode &&
    !subUnitOptions.some(({ value }) => value === serviceSubUnitCode)
  ) {
    subUnitOptions.unshift({
      value: serviceSubUnitCode,
      label: serviceSubUnitName ?? serviceSubUnitCode
    });
  }

  // In edit mode only the service name and the client ID can be changed,
  // while the owner, the sub-unit and the purpose ID are read-only.
  if (editMode) {
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
            disabled
            options={ownerOptions}
          />
          {isSubUnitOwner && (
            <FormComponent.ControlledSelect
              name="E_SERVICE.subUnitCode"
              control={control}
              label={t('integrations.add.eService.fields.subUnit')}
              options={subUnitOptions}
              disabled
              required
            />
          )}
        </WizardStepWrapper>

        <WizardStepWrapper
          title={t('integrations.add.eService.configure.title')}
          subtitle={t('integrations.add.eService.configure.description')}
          sx={{ marginTop: 2 }}
        >
          <Stack spacing={2}>
            <FieldGroup title={t('integrations.add.eService.generalInfo')}>
              <FormComponent.ControlledTextField
                name="E_SERVICE.eServiceName"
                control={control}
                label={t('integrations.add.eService.fields.eServiceName')}
                required
              />
              <FormComponent.ControlledTextField
                name="E_SERVICE.purposeId"
                control={control}
                label={t('integrations.add.eService.fields.purposeId')}
                disabled
              />
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
      </>
    );
  }

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
          options={ownerOptions}
        />
        {isSubUnitOwner && (
          <FormComponent.ControlledSelect
            name="E_SERVICE.subUnitCode"
            control={control}
            label={t('integrations.add.eService.fields.subUnit')}
            options={subUnitOptions}
            required
          />
        )}
        {errorType ? (
          <Box mt={2}>
            <MIAlert
              severity="error"
              title={t(
                `integrations.add.eService.errors.${errorType}.${ownerType}.title`
              )}
            >
              {t(
                `integrations.add.eService.errors.${errorType}.${ownerType}.message`
              )}
            </MIAlert>
          </Box>
        ) : null}
      </WizardStepWrapper>

      {canAddSendService && clientsLength ? (
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
