import { zodResolver } from '@hookform/resolvers/zod';
import { Box } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { generatePath, useNavigate, useParams } from 'react-router';

import { OrgSubUnitStatus, SubUnitType } from '@generated/core/data-contracts';

import { createOrgSubUnit } from '@core/api/orgSubUnit';
import { FormComponent } from '@core/components/FormComponent';
import { SelectOptions } from '@core/components/FormComponent/_Select';
import TitleComponent from '@core/components/TitleComponent/TitleComponent';
import SectionBox from '@core/components/Wizard/SectionBox';
import WizardStepButtons from '@core/components/Wizard/WizardStepButtons';
import WizardStepWrapper from '@core/components/Wizard/WizardStepWrapper';
import utils from '@core/utils';
import { PageRoutes } from '..';
import { MIAlert } from '@pagopa/mui-italia';

const subUnitSchema = z.object({
  subUnitCode: z.string({
    required_error: 'subunits.create.subUnitCode.required'
  }),
  subUnitType: z.nativeEnum(SubUnitType, {
    required_error: 'subunits.create.subUnitType.required'
  }),
  subUnitName: z.string({
    required_error: 'subunits.create.subUnitName.required'
  })
});

type SubUnitFormData = z.infer<typeof subUnitSchema>;

export const SubUnitCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { organizationId: urlOrganizationId } = useParams();

  const organizationId = Number(urlOrganizationId);
  if (isNaN(organizationId)) {
    navigate(PageRoutes.ERROR);
  }

  const create = createOrgSubUnit(organizationId);

  const form = useForm<SubUnitFormData>({
    resolver: zodResolver(subUnitSchema),
    mode: 'onTouched'
  });

  const isDuplicated = form.formState.errors.subUnitCode?.type === 'server';

  const onSubmit: SubmitHandler<SubUnitFormData> = async (data) => {
    try {
      await create.mutateAsync({
        ...data,
        organizationId,
        status: OrgSubUnitStatus.ACTIVE
      });
      navigate(
        generatePath(PageRoutes.ORGANIZATIONS_SUB_UNITS, { organizationId })
      );
      utils.notify.emit(t('commons.done'), 'success');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        form.setError('subUnitCode', {
          type: 'server',
          message: 'subunits.create.duplicatedCode.message'
        });
      } else {
        navigate(PageRoutes.RESPONSES_ERROR);
      }
    }
  };

  const onCancel = () => {
    navigate(
      generatePath(PageRoutes.ORGANIZATIONS_SUB_UNITS, { organizationId })
    );
  };

  const typeOptions: SelectOptions = Object.values(SubUnitType).map((type) => ({
    value: type,
    label: type
  }));

  return (
    <form aria-label="form">
      <Box sx={{ mb: 4 }}>
        <TitleComponent
          title={t('subunits.create.title')}
          variant="h3"
          description={t('subunits.create.description')}
        />
      </Box>
      {isDuplicated && (
        <MIAlert
          title={t('subunits.create.duplicatedCode.title')}
          severity="error"
          sx={{ mb: 4 }}
          action={{
            label: t('subunits.create.duplicatedCode.action'),
            onClick: () => {
              form.clearErrors('subUnitCode');
            }
          }}
          data-testid="duplicated-code-alert"
        >
          {t('subunits.create.duplicatedCode.message')}
        </MIAlert>
      )}
      <WizardStepWrapper
        title={t('subunits.create.wizard.title')}
        subtitle={t('subunits.create.wizard.subtitle')}
        alertMessage={t('subunits.create.wizard.alertMessage')}
      >
        <SectionBox
          data-testid="create-subunit-section"
          title={t('subunits.create.section')}
        >
          <FormComponent.ControlledTextField
            required
            name="subUnitCode"
            control={form.control}
            sx={{ flex: 1 }}
            label={t('subunits.subUnitCode')}
            placeholder={t('subunits.create.subUnitCode.placeholder')}
            data-testid="subunitCode-field"
          />
          <FormComponent.ControlledSelect
            required
            name="subUnitType"
            options={typeOptions}
            control={form.control}
            label={t('subunits.subUnitType')}
            placeholder={t('subunits.create.subUnitType.placeholder')}
            data-testid="subunitType-field"
          />
          <FormComponent.ControlledTextField
            required
            name="subUnitName"
            control={form.control}
            label={t('subunits.subUnitName')}
            data-testid="subunitName-field"
            placeholder={t('subunits.create.subUnitName.placeholder')}
          />
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons
        onNext={form.handleSubmit(onSubmit)}
        onBack={onCancel}
        nextLabel="commons.confirm"
        backLabel="commons.back"
        disableNext={create.isPending}
        disableBack={create.isPending}
      />
    </form>
  );
};
