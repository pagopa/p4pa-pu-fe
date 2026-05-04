import { useFormContext } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import MessageIcon from '@mui/icons-material/Message';
import Typography from '@mui/material/Typography';
import SectionBox from '../../../../components/Wizard/SectionBox';
import WizardStepWrapper from '../../../../components/Wizard/WizardStepWrapper';
import { FormComponent } from '../../../../components/FormComponent';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { DebtTypeOrgForm } from '../../types';
import { AppPreview } from '../../../../components/AppPreview';
import { theme } from '@pagopa/mui-italia';

export const Step4Notifications = () => {
  const { t } = useTranslation();
  const { control, watch } = useFormContext<DebtTypeOrgForm>();

  const flagNotifyIo = watch('flagNotifyIo');
  const ioTemplateSubject = watch('ioTemplateSubject');
  const ioTemplateMessage = watch('ioTemplateMessage');

  return (
    <WizardStepWrapper
      title={t('debtTypeOrgCreate.notifications.title')}
      subtitle={t('debtTypeOrgCreate.notifications.subtitle')}
    >
      <FormComponent.ControlledSwitch
        label={t('debtTypeOrgCreate.notifications.enableNotifications')}
        name="flagNotifyIo"
        control={control}
      />
      {flagNotifyIo && (
        <>
          <Typography mt={2} variant="body2" color={theme.palette.error.dark}>
            {t('debtTypeOrgCreate.notifications.alertMessage')}
          </Typography>
          <SectionBox
            title={t('debtTypeOrgCreate.notifications.section.message')}
            adornment={<MessageIcon />}
          >
            <Stack gap={3}>
              <Stack gap={0.5}>
                <FormComponent.ControlledTextField
                  name="serviceId"
                  data-testid="serviceId"
                  control={control}
                  label={t(
                    'debtTypeOrgCreate.notifications.serviceApiKey.label'
                  )}
                  required
                />
                <Typography variant="caption" ml={2}>
                  {t('debtTypeOrgCreate.notifications.serviceApiKey.caption')}
                </Typography>
              </Stack>
              <Stack gap={0.5}>
                <FormComponent.ControlledTextField
                  name="ioTemplateSubject"
                  data-testid="ioTemplateSubject"
                  control={control}
                  label={t(
                    'debtTypeOrgCreate.notifications.messageSubject.label'
                  )}
                  required
                />
              </Stack>
              <Stack gap={0.5}>
                <FormComponent.ControlledTextField
                  name="ioTemplateMessage"
                  data-testid="ioTemplateMessage"
                  control={control}
                  label={t('debtTypeOrgCreate.notifications.messageBody.label')}
                  multiline
                  rows={4}
                  required
                />
                <Typography variant="caption" component="span" ml={2}>
                  <Trans
                    i18nKey="debtTypeOrgCreate.notifications.messageBody.caption"
                    components={[
                      // TODO: add correct link to IO message guide
                      <Link
                        key="link"
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="none"
                      />
                    ]}
                  />
                </Typography>
              </Stack>
            </Stack>
            <AppPreview
              subject={ioTemplateSubject}
              message={ioTemplateMessage}
            />
          </SectionBox>
        </>
      )}
    </WizardStepWrapper>
  );
};
