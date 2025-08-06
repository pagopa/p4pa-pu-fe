import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { Stack, Box, Typography, TextField } from '@mui/material';
import BookIcon from '@mui/icons-material/MenuBook';
import WizardStepWrapper from '../../components/Wizard/WizardStepWrapper';
import SectionBox from '../../components/Wizard/SectionBox';
import WizardStepButtons from '../../components/Wizard/WizardStepButtons';
import { useStore } from '../../store/GlobalStore';
import { createClientSil } from '../../api/clientSil';
import { PageRoutes } from '../../routes';
import utils from '../../utils';

/**
 * Schema of validation for the creation of a Client SIL
 */
const clientSilCreateSchema = z.object({
  clientName: z
    .string({
      required_error: 'clientSil.create.fields.clientName.required'
    })
    .min(1, 'clientSil.create.fields.clientName.required')
    .regex(
      /^[a-zA-Z0-9-_]*$/,
      'clientSil.create.fields.clientName.invalidFormat'
    )
});

type ClientSilCreateFormData = z.infer<typeof clientSilCreateSchema>;

/**
 * Component for the creation of a new Client SIL
 * Handles input form, validation and API call
 */
export const ClientSilCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    state: { organizationId }
  } = useStore();

  const methods = useForm<ClientSilCreateFormData>({
    resolver: zodResolver(clientSilCreateSchema),
    mode: 'onTouched',
    defaultValues: {
      clientName: ''
    }
  });

  const createClientSilMutation = createClientSil(Number(organizationId));

  const { handleSubmit, trigger } = methods;

  const onSubmit = useCallback(
    async (data: ClientSilCreateFormData) => {
      try {
        const response = await createClientSilMutation.mutateAsync({
          clientName: data.clientName
        });

        utils.notify.emit(
          t('clientSil.create.success', {
            clientName: data.clientName
          }),
          'success'
        );
        navigate(PageRoutes.RESPONSES_SUCCESS, {
          replace: true,
          state: {
            category: 'client-sil',
            i18nParams: {
              clientName: response.clientName
            },
            clientId: response.clientId
          }
        });
      } catch (error) {
        console.error('Error creating Client SIL:', error);

        if (error instanceof AxiosError) {
          if (error.response?.status === 409) {
            utils.notify.emit(
              t('clientSil.create.error.nameAlreadyExists'),
              'error'
            );
            return;
          }
        }
        navigate(PageRoutes.RESPONSES_ERROR);
      }
    },
    [createClientSilMutation, navigate, t]
  );

  const handleSave = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      handleSubmit(onSubmit)();
    }
  }, [trigger, handleSubmit, onSubmit]);

  const handleBack = useCallback(() => {
    navigate(PageRoutes.CLIENT_SIL_INDEX);
  }, [navigate]);

  return (
    <FormProvider {...methods}>
      <form aria-label={t('clientSil.create.formLabel')} role="form" noValidate>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {t('clientSil.create.title')}
          </Typography>
        </Box>
        <WizardStepWrapper
          title={t('clientSil.create.section.description.title')}
        >
          <SectionBox
            title={t('clientSil.create.section.description.subtitle')}
            adornment={<BookIcon />}
            data-testid="client-sil-configuration-section"
          >
            <Stack direction="column" spacing={3}>
              <Controller
                name="clientName"
                control={methods.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="client-name-input"
                    data-testid="client-name-field"
                    label={t('clientSil.create.fields.clientName.label')}
                    placeholder={t(
                      'clientSil.create.fields.clientName.placeholder'
                    )}
                    fullWidth
                    margin="normal"
                    required
                    disabled={createClientSilMutation.isPending}
                    error={!!methods.formState.errors.clientName}
                    helperText={
                      methods.formState.errors.clientName?.message
                        ? t(methods.formState.errors.clientName.message)
                        : undefined
                    }
                  />
                )}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {t('clientSil.create.subtitle')}
              </Typography>
            </Stack>
          </SectionBox>
          <WizardStepButtons
            onBack={handleBack}
            onNext={handleSave}
            nextLabel="commons.save"
            backLabel="commons.back"
            disableNext={createClientSilMutation.isPending}
            disableBack={createClientSilMutation.isPending}
          />
        </WizardStepWrapper>
      </form>
    </FormProvider>
  );
};

export default ClientSilCreate;
