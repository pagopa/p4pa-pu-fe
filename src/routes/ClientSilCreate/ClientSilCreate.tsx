import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AxiosError } from 'axios';
import { Stack, Box, Typography, TextField } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';

import WizardStepWrapper from '../../components/Wizard/WizardStepWrapper';
import SectionBox from '../../components/Wizard/SectionBox';
import WizardStepButtons from '../../components/Wizard/WizardStepButtons';
import { useStore } from '../../store/GlobalStore';
import { createClientSil } from '../../api/clientSil';
import { PageRoutes } from '../../routes';
import utils from '../../utils';

/**
 * Schema di validazione per la creazione di un Client SIL
 */
const clientSilCreateSchema = z.object({
  clientName: z
    .string({
      required_error: 'clientSil.create.fields.clientName.required'
    })
    .min(1, 'clientSil.create.fields.clientName.required')
    .max(100, 'clientSil.create.fields.clientName.maxLength')
    .regex(
      /^[a-zA-Z0-9-_]*$/,
      'clientSil.create.fields.clientName.invalidFormat'
    )
});

type ClientSilCreateFormData = z.infer<typeof clientSilCreateSchema>;

/**
 * Componente per la creazione di un nuovo Client SIL
 * Gestisce form di input, validazione e chiamata API
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

  /**
   * Gestisce il submit del form
   */
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

        console.log('response', response);

        navigate(PageRoutes.CLIENT_SIL_INDEX, { replace: true });
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
          if (error.response?.status === 400) {
            utils.notify.emit(t('clientSil.create.error.invalidData'), 'error');
            return;
          }
        }

        utils.notify.emit(t('clientSil.create.error.generic'), 'error');
      }
    },
    [createClientSilMutation, navigate, t]
  );

  /**
   * Gestisce il click del pulsante Salva
   * Valida il form prima di procedere con il submit
   */
  const handleSave = useCallback(async () => {
    const isValid = await trigger();
    if (isValid) {
      handleSubmit(onSubmit)();
    }
  }, [trigger, handleSubmit, onSubmit]);

  /**
   * Gestisce il click del pulsante Indietro
   */
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
            adornment={<DescriptionIcon />}
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
                    helperText={methods.formState.errors.clientName?.message ? t(methods.formState.errors.clientName.message) : undefined}
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
