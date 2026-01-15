import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, Box, Paper, Typography, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { theme } from '@pagopa/mui-italia';
import { ArrowBack, Description, Translate } from '@mui/icons-material';
import { AxiosError } from 'axios';
import { useStore } from '../../../store/GlobalStore';
import spontaneousFormApi from '../../../api/spontaneousForm';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import SectionBox from '../../../components/Wizard/SectionBox';
import { FormComponent } from '../../../components/FormComponent';
import { PageRoutes } from '../..';
import {
  SpontaneousFormCreateData,
  spontaneousFormCreateSchema
} from './schemas/spontaneousFormCreateSchema';

const SpontaneousFormCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    state: { organizationId }
  } = useStore();

  const { control, handleSubmit, setError, formState } =
    useForm<SpontaneousFormCreateData>({
      resolver: zodResolver(spontaneousFormCreateSchema),
      mode: 'onSubmit',
      reValidateMode: 'onChange',
      defaultValues: {
        code: '',
        structure: '',
        dictionary: ''
      }
    });

  const createMutation = spontaneousFormApi.createSpontaneousForm({
    organizationId: Number(organizationId)
  });

  const handleApiError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const status = error.response?.status;

      if (status === 409) {
        setError('code', {
          type: 'manual',
          message: 'spontaneousForm.create.errors.codeAlreadyExists'
        });
      } else {
        navigate(PageRoutes.RESPONSES_ERROR, {
          state: {
            errorType: 'spontaneous-form-create'
          }
        });
      }
    } else {
      navigate(PageRoutes.RESPONSES_ERROR, {
        state: {
          errorType: 'spontaneous-form-create'
        }
      });
    }
  };

  const onSubmit = async (formData: SpontaneousFormCreateData) => {
    try {
      await createMutation.mutateAsync({
        organizationId: Number(organizationId),
        code: formData.code.trim(),
        structure: JSON.parse(formData.structure),
        dictionary: formData.dictionary?.trim()
          ? JSON.parse(formData.dictionary)
          : undefined
      });

      navigate(PageRoutes.RESPONSES_SUCCESS, {
        state: {
          category: 'spontaneous-form-create',
          i18nParams: { formCode: formData.code.trim() }
        }
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleCancel = () => {
    navigate(PageRoutes.SPONTANEOUS_FORM_INDEX);
  };

  return (
    <Box sx={{ p: 3 }}>
      <TitleComponent
        title={t('spontaneousForm.create.title')}
        description={t('spontaneousForm.create.description')}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          <Paper sx={{ p: 4, mt: 3 }}>
            <Typography variant="h6" color={theme.palette.text.primary} mb={2}>
              {t('spontaneousForm.create.formConfiguration')}
            </Typography>
            <Typography variant="body2" color={theme.palette.error.dark} mb={4}>
              {t('commons.requiredFieldDescription')}
            </Typography>

            <SectionBox
              title={t('spontaneousForm.create.generalConfiguration')}
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
                      label={t('spontaneousForm.create.identificationCode')}
                      fullWidth
                      required
                      size="small"
                      disabled={createMutation.isPending}
                      error={!!formState.errors.code}
                      helperText={
                        formState.errors.code?.message
                          ? t(formState.errors.code.message)
                          : t('spontaneousForm.create.codeHelperText')
                      }
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
                      label={t('spontaneousForm.create.structure')}
                      fullWidth
                      required
                      size="small"
                      multiline
                      minRows={4}
                      maxRows={4}
                      disabled={createMutation.isPending}
                      error={!!formState.errors.structure}
                      helperText={
                        formState.errors.structure?.message
                          ? t(formState.errors.structure.message)
                          : t('spontaneousForm.create.structureHelperText')
                      }
                    />
                  )}
                />
              </Stack>
            </SectionBox>

            <SectionBox
              title={t('spontaneousForm.create.translations')}
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
                    label={t('spontaneousForm.create.dictionary')}
                    fullWidth
                    size="small"
                    multiline
                    minRows={4}
                    maxRows={4}
                    disabled={createMutation.isPending}
                    error={!!formState.errors.dictionary}
                    helperText={
                      formState.errors.dictionary?.message
                        ? t(formState.errors.dictionary.message)
                        : t('spontaneousForm.create.dictionaryHelperText')
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
                onClick={handleCancel}
                startIcon={<ArrowBack />}
                label={t('commons.back')}
                size="large"
              />
            </Box>
            <Box>
              <FormComponent.Button
                data-testid="submit-button"
                type="submit"
                label={t('commons.add')}
                size="large"
                disabled={createMutation.isPending}
              />
            </Box>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
};

export default SpontaneousFormCreate;
