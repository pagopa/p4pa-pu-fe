import { useForm, Controller, UseFormSetError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, Box, Paper, Typography, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { theme } from '@pagopa/mui-italia';
import { ArrowBack, Description, Translate } from '@mui/icons-material';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import SectionBox from '../../../components/Wizard/SectionBox';
import { FormComponent } from '../../../components/FormComponent';
import {
  SpontaneousFormCreateData,
  spontaneousFormCreateSchema
} from './schemas/spontaneousFormCreateSchema';

export type SpontaneousFormMode = 'create' | 'edit';

export type SpontaneousFormSubmitHandler = (
  data: SpontaneousFormCreateData,
  setError?: UseFormSetError<SpontaneousFormCreateData>
) => void | Promise<void>;

export type SpontaneousFormFormProps = {
  mode: SpontaneousFormMode;
  initialData?: {
    code: string;
    structure: string;
    dictionary?: string;
  };
  isPending: boolean;
  onSubmit: SpontaneousFormSubmitHandler;
  onCancel: () => void;
};

const SpontaneousFormForm = ({
  mode,
  initialData,
  isPending,
  onSubmit,
  onCancel
}: SpontaneousFormFormProps) => {
  const { t } = useTranslation();

  const isEditMode = mode === 'edit';

  const { control, handleSubmit, setError, formState } =
    useForm<SpontaneousFormCreateData>({
      resolver: zodResolver(spontaneousFormCreateSchema),
      mode: 'onSubmit',
      reValidateMode: 'onChange',
      defaultValues: {
        code: initialData?.code ?? '',
        structure: initialData?.structure ?? '',
        dictionary: initialData?.dictionary ?? ''
      }
    });

  const handleFormSubmit = (data: SpontaneousFormCreateData) => {
    onSubmit(data, setError);
  };

  const i18nPrefix = isEditMode
    ? 'spontaneousForm.edit'
    : 'spontaneousForm.create';

  return (
    <Box sx={{ p: 3 }}>
      <TitleComponent
        title={t(`${i18nPrefix}.title`)}
        description={t(`${i18nPrefix}.description`)}
      />

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Stack spacing={3}>
          <Paper sx={{ p: 4, mt: 3 }}>
            <Typography variant="h6" color={theme.palette.text.primary} mb={2}>
              {t(`${i18nPrefix}.formConfiguration`)}
            </Typography>
            <Typography variant="body2" color={theme.palette.error.dark} mb={4}>
              {t('commons.requiredFieldDescription')}
            </Typography>

            <SectionBox
              title={t(`${i18nPrefix}.generalConfiguration`)}
              adornment={<Description />}
            >
              <Stack spacing={3}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="code"
                      data-testid="code"
                      label={t(`${i18nPrefix}.identificationCode`)}
                      fullWidth
                      required
                      size="small"
                      disabled={isPending || isEditMode}
                      error={!!formState.errors.code}
                      helperText={
                        formState.errors.code?.message
                          ? t(formState.errors.code.message)
                          : t(`${i18nPrefix}.codeHelperText`)
                      }
                      InputProps={{
                        readOnly: isEditMode
                      }}
                    />
                  )}
                />
                <Controller
                  name="structure"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      id="structure"
                      data-testid="structure"
                      label={t(`${i18nPrefix}.structure`)}
                      fullWidth
                      required
                      size="small"
                      multiline
                      minRows={4}
                      maxRows={16}
                      disabled={isPending}
                      error={!!formState.errors.structure}
                      helperText={
                        formState.errors.structure?.message
                          ? t(formState.errors.structure.message)
                          : t(`${i18nPrefix}.structureHelperText`)
                      }
                    />
                  )}
                />
              </Stack>
            </SectionBox>

            <SectionBox
              title={t(`${i18nPrefix}.translations`)}
              adornment={<Translate />}
            >
              <Controller
                name="dictionary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="dictionary"
                    data-testid="dictionary"
                    label={t(`${i18nPrefix}.dictionary`)}
                    fullWidth
                    size="small"
                    multiline
                    minRows={4}
                    maxRows={16}
                    disabled={isPending}
                    error={!!formState.errors.dictionary}
                    helperText={
                      formState.errors.dictionary?.message
                        ? t(formState.errors.dictionary.message)
                        : t(`${i18nPrefix}.dictionaryHelperText`)
                    }
                  />
                )}
              />
            </SectionBox>
          </Paper>

          <Stack
            display="flex"
            direction="row"
            spacing={2}
            justifyContent="space-between"
          >
            <Box>
              <FormComponent.Button
                data-testid="cancel-button"
                variant="outlined"
                onClick={onCancel}
                startIcon={<ArrowBack />}
                label={t('commons.back')}
                size="large"
              />
            </Box>
            <Box>
              <FormComponent.Button
                data-testid="submit-button"
                type="submit"
                label={isEditMode ? t('commons.save') : t('commons.add')}
                size="large"
                disabled={isPending}
              />
            </Box>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};

export default SpontaneousFormForm;
