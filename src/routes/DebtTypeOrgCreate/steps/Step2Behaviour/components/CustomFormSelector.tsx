import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import CategoryIcon from '@mui/icons-material/Category';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FormComponent } from '../../../../../components/FormComponent';
import { DebtTypeOrgForm } from '../../../types';

type CustomFormSelectorProps = {
  control: Control<DebtTypeOrgForm>;
  isLoading: boolean;
  customFormOptions: Array<{ label: string; value: number }>;
};

export const CustomFormSelector = ({
  control,
  isLoading,
  customFormOptions
}: CustomFormSelectorProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('commons.loading')}
      </Typography>
    );
  }

  if (!customFormOptions.length) {
    return (
      <Box
        sx={{
          mt: 2,
          backgroundColor: 'grey.100',
          borderRadius: 2,
          p: 4,
          border: 1,
          borderColor: 'grey.300',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <Stack alignItems="center">
          <CategoryIcon sx={{ fontSize: 32, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {t('debtTypeOrgCreate.behaviour.customForms.empty.message')}{' '}
            <Link
              href={t('debtTypeOrgCreate.behaviour.customForms.empty.linkHref')}
              underline="always"
              fontWeight="bold"
              onClick={(e) => {
                e.preventDefault();
                // TODO: replace with navigation when available
                console.log('Navigate to custom modules');
              }}
            >
              {t('debtTypeOrgCreate.behaviour.customForms.empty.linkLabel')}
            </Link>
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {t('debtTypeOrgCreate.behaviour.customForms.empty.action')}
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <FormComponent.ControlledSelect
      control={control}
      name="customFormId"
      data-testid="customFormId"
      label={t('debtTypeOrgCreate.behaviour.customForms.select.label')}
      options={customFormOptions}
      required
      fullWidth
    />
  );
};
