import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import LocalOffer from '@mui/icons-material/LocalOffer';
import BookIcon from '@mui/icons-material/MenuBook';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { z } from 'zod';

import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../components/FormComponent';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import { DebtPositionTypeDetailDTO } from '../../../../generated/data-contracts';
import { TaxonomyFilter } from '../../../components/TaxonomyFilter';
import { TaxonomyEdit } from './components/TaxonomyEdit';
import { taxonomySchema } from '../../../components/TaxonomyFilter/schema';
import { TaxonomyFields } from '../../../models/Taxonomy';

export type Step1Data = TaxonomyFields & {
  description: string;
  code: string;
};

export type Step1Props = {
  setData?: (data: Step1Data) => void;
  onNext: () => void;
  onBack: () => void;
  editmode?: boolean;
  prefilledData?: DebtPositionTypeDetailDTO;
};

const schema = z
  .object({
    code: z.string({
      required_error: 'debtTypeCreate.configuration.debtTypeCode.required'
    }),
    description: z
      .string({
        required_error: 'debtTypeCreate.configuration.debtType.required'
      })
      .max(100, 'debtTypeCreate.configuration.debtType.maxCharacters')
  })
  .merge(taxonomySchema);

export const Step1Configuration = ({
  setData,
  onNext,
  onBack,
  editmode = false,
  prefilledData = undefined
}: Step1Props) => {
  const { t } = useTranslation();

  const form = useForm<Step1Data>({
    resolver: zodResolver(schema),
    mode: 'onTouched'
  });

  const { control, handleSubmit, watch } = form;
  const organizationType = watch('orgType');

  const onSubmit = async (values: Step1Data) => {
    if (setData) {
      setData(values);
    }
    onNext();
  };

  const onInvalid = async () => {
    if (editmode) {
      onNext();
    }
  };

  return (
    <FormProvider {...form} data-testid="step1-configuration">
      <form aria-label="form">
        <WizardStepWrapper
          title={t('debtTypeCreate.configuration.title')}
          subtitle={t('debtTypeCreate.configuration.subtitle')}
          alertMessage={
            (!editmode && t('debtTypeCreate.configuration.alertMessage')) || ''
          }
        >
          <SectionBox
            data-testid="step1-configuration-debt-type"
            title={t('debtTypeCreate.configuration.debtType.title')}
            adornment={<BookIcon />}
          >
            <Stack direction="row" spacing={3}>
              <FormComponent.ControlledTextField
                name="code"
                control={control}
                sx={{ flex: 1 }}
                label={t('debtTypeCreate.configuration.debtTypeCode.label')}
                data-testid="code"
                defaultValue={editmode ? prefilledData?.code : ''}
                disabled={editmode}
              />
              <Stack flex={3}>
                <FormComponent.ControlledTextField
                  name="description"
                  control={control}
                  label={t('debtTypeCreate.configuration.debtType.label')}
                  data-testid="description"
                  placeholder={t(
                    'debtTypeCreate.configuration.debtType.placeholder'
                  )}
                  adornment={`${form.getValues('description')?.length || 0}/100`}
                  defaultValue={editmode ? prefilledData?.description : ''}
                  disabled={editmode}
                />
                <Typography variant="caption" px={1.5}>
                  {t('debtTypeCreate.configuration.debtType.helper')}
                </Typography>
              </Stack>
            </Stack>
          </SectionBox>
          <SectionBox
            data-testid="step1-configuration-taxonomy"
            title={t('debtTypeCreate.configuration.taxonomy.title')}
            adornment={<LocalOffer />}
          >
            {editmode ? (
              <TaxonomyEdit prefilledData={prefilledData} />
            ) : (
              <TaxonomyFilter
                render={(fields) => (
                  <Stack
                    gap={2}
                    data-testid="step1-configuration-taxonomy-fields"
                  >
                    {/* orgType is always visible */}
                    {fields.orgType}
                    {/* Render rest only if orgType is selected */}
                    {organizationType && (
                      <>
                        <Stack direction="row" gap={2}>
                          {fields.macroAreaCode}
                          {fields.serviceTypeCode}
                        </Stack>
                        <Stack direction="row" gap={2}>
                          {fields.collectingReason}
                          {fields.taxonomyCode}
                        </Stack>
                      </>
                    )}
                  </Stack>
                )}
              />
            )}
          </SectionBox>
        </WizardStepWrapper>

        <WizardStepButtons
          onBack={onBack}
          onNext={handleSubmit(onSubmit, onInvalid)}
        />
      </form>
    </FormProvider>
  );
};
