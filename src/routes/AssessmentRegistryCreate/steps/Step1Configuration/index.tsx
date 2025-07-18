import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BookIcon from '@mui/icons-material/MenuBook';
import Stack from '@mui/material/Stack';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import { useStore } from '../../../../store/GlobalStore';
import { useDebtPositionTypesByOrg } from '../../../../hooks/useDebtPositionTypesByOrg';
import Typography from '@mui/material/Typography';

export type Step1Data = {
  debtPositionTypeId: string;
  description: string;
  code: string;
};

export const Step1Configuration = ({ edit }: { edit?: boolean }) => {
  const { t } = useTranslation();

  const {
    state: { organizationId }
  } = useStore();

  const selectionQuery = useDebtPositionTypesByOrg({
    organizationId
  });

  const i18nKey = edit
    ? 'AssessmentRegistryUpdate'
    : 'AssessmentRegistryCreate';

  const { control } = useFormContext();

  return (
    <Stack gap={3}>
      <Stack mt={2}>
        <Typography variant="h4">{t(`${i18nKey}.title`)}</Typography>
        <Typography variant="body1">{t(`${i18nKey}.subtitle`)}</Typography>
      </Stack>
      <WizardStepWrapper>
        <Typography variant="h6">{t(`${i18nKey}.configuration`)}</Typography>
        <SectionBox
          title={t('AssessmentRegistryCreate.debtPositionType')}
          adornment={<BookIcon />}
        >
          <FormComponent.ControlledSelect
            name="debtPositionType"
            data-testid="debtPositionType"
            control={control}
            label={t('AssessmentRegistryCreate.debtPositionType')}
            options={selectionQuery?.data?.codeMap}
            disabled={!selectionQuery?.data?.codeMap?.length}
            required
          />
        </SectionBox>

        <SectionBox
          title={t('AssessmentRegistryCreate.assessmentRegistry')}
          adornment={<ListAltIcon />}
        >
          <Stack direction="row" spacing={3}>
            <FormComponent.ControlledSelect
              name="status"
              data-testid="status"
              control={control}
              sx={{ flex: 0.7 }}
              label={t('AssessmentRegistryCreate.status')}
              options={[
                {
                  label: t('commons.status.ACTIVE'),
                  value: 'ACTIVE'
                },
                {
                  label: t('commons.status.INACTIVE'),
                  value: 'INACTIVE'
                }
              ]}
              required
            />
            <Stack sx={{ flex: 0.3 }}>
              <FormComponent.ControlledDateRange
                name="operatingYear"
                data-testid="operatingYear"
                control={control}
                from={{
                  label: t('AssessmentRegistryCreate.operatingYear')
                }}
                isYear
                required
              />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={3}>
            <FormComponent.ControlledTextField
              name="sectionCode"
              data-testid="sectionCode"
              control={control}
              sx={{ flex: 0.4 }}
              label={t('AssessmentRegistryCreate.sectionCode')}
              required
            />
            <FormComponent.ControlledTextField
              name="sectionDescription"
              data-testid="sectionDescription"
              control={control}
              sx={{ flex: 0.6 }}
              label={t('AssessmentRegistryCreate.sectionDescription')}
              required
            />
          </Stack>
          <Stack direction="row" spacing={3}>
            <FormComponent.ControlledTextField
              name="officeCode"
              data-testid="officeCode"
              control={control}
              sx={{ flex: 0.4 }}
              label={t('AssessmentRegistryCreate.officeCode')}
              required
            />
            <FormComponent.ControlledTextField
              name="officeDescription"
              data-testid="officeDescription"
              control={control}
              sx={{ flex: 0.6 }}
              label={t('AssessmentRegistryCreate.officeDescription')}
              required
            />
          </Stack>
          <Stack direction="row" spacing={3}>
            <FormComponent.ControlledTextField
              name="assessmentCode"
              data-testid="assessmentCode"
              control={control}
              sx={{ flex: 0.4 }}
              label={t('AssessmentRegistryCreate.assessmentCode')}
              required
            />
            <FormComponent.ControlledTextField
              name="assessmentDescription"
              data-testid="assessmentDescription"
              control={control}
              sx={{ flex: 0.6 }}
              label={t('AssessmentRegistryCreate.assessmentDescription')}
              required
            />
          </Stack>
        </SectionBox>
      </WizardStepWrapper>
    </Stack>
  );
};
