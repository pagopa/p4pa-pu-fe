import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PreviewIcon from '@mui/icons-material/Preview';
import { z } from 'zod';
import { Trans, useTranslation } from 'react-i18next';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Link,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import MessageIcon from '@mui/icons-material/Message';
import WizardStepWrapper from '../../../components/Wizard/WizardStepWrapper';
import SectionBox from '../../../components/Wizard/SectionBox';
import WizardStepButtons from '../../../components/Wizard/WizardStepButtons';
import { FormComponent } from '../../../components/FormComponent';

export type Step2Data = {
  option1?: boolean;
  option2?: boolean;
  option3?: boolean;
  checkbox2?: boolean;
  textField?: string;
  textArea?: string;
};

export type Step2Props = {
  setData: (data: Step2Data) => void;
  onNext: () => void;
  onBack?: () => void;
};

export const Step2Settings = ({ onBack, setData, onNext }: Step2Props) => {
  const { t } = useTranslation();

  const schema = z
    .object({
      option1: z.boolean().optional(),
      option2: z.boolean().optional(),
      option3: z.boolean().optional(),
      checkbox2: z.boolean().optional(),
      textField: z.string().optional().default(''),
      textArea: z.string().optional().default('')
    })
    .refine((data) => !data.checkbox2 || data.textField, {
      message: t('debtTypeCreate.settings.subject.required'),
      path: ['textField'] // Targets the textField property
    })
    .refine((data) => !data.checkbox2 || data.textArea, {
      message: t('debtTypeCreate.settings.message.required'),
      path: ['textArea']
    });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<Step2Data>({
    resolver: zodResolver(schema),
    mode: 'onTouched'
  });

  const onSubmit = (values: Step2Data) => {
    setData(values);
    onNext();
  };

  const options: Array<keyof Step2Data> = ['option1', 'option2', 'option3'];
  const checkbox2 = watch('checkbox2');

  return (
    <form>
      <WizardStepWrapper
        title={t('debtTypeCreate.settings.title')}
        subtitle={t('debtTypeCreate.settings.subtitle')}
      >
        <SectionBox
          title={t('debtTypeCreate.settings.behaviour')}
          adornment={<TuneIcon />}
        >
          <FormGroup>
            {options.map((optionKey) => (
              <Controller
                key={optionKey}
                name={optionKey}
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={!!field.value} />}
                    label={
                      <Box>
                        <Typography variant="body1">
                          {t(
                            `debtTypeCreate.settings.${optionKey}.description`
                          )}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {t(`debtTypeCreate.settings.${optionKey}.subtitle`)}
                        </Typography>
                      </Box>
                    }
                  />
                )}
              />
            ))}
          </FormGroup>
        </SectionBox>

        <SectionBox
          title={t('debtTypeCreate.settings.template.title')}
          subtitle={t('debtTypeCreate.settings.template.helper')}
          adornment={<MessageIcon />}
        >
          <Stack direction="row" gap={2} alignItems="center" width="100%">
            <Stack>
              <Controller
                name="checkbox2"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={!!field.value} />}
                    label={t('debtTypeCreate.settings.template.checkbox')}
                  />
                )}
              />

              <Controller
                name="textField"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <FormComponent.TextField
                    {...field}
                    ref={null}
                    required={checkbox2}
                    label={t('debtTypeCreate.settings.subject.label')}
                    placeholder={t(
                      'debtTypeCreate.settings.subject.placeholder'
                    )}
                    error={checkbox2 && !!errors.textField}
                    helperText={checkbox2 && errors.textField?.message}
                    fullWidth
                    sx={{ my: 2 }}
                  />
                )}
              />
              <Typography
                variant="body2"
                color="textSecondary"
                component="span"
              >
                <Trans
                  i18nKey="debtTypeCreate.settings.subject.guide"
                  components={[
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

              <Controller
                name="textArea"
                control={control}
                render={({ field }) => (
                  <TextField
                    required={checkbox2}
                    label={t('debtTypeCreate.settings.message.label')}
                    InputLabelProps={{ shrink: true }}
                    error={checkbox2 && !!errors.textArea}
                    helperText={checkbox2 && errors.textArea?.message}
                    defaultValue=""
                    fullWidth
                    multiline
                    rows={7}
                    sx={{ my: 2 }}
                    {...field}
                  />
                )}
              />

              <Typography
                variant="body2"
                color="textSecondary"
                component="span"
              >
                <Trans
                  i18nKey="debtTypeCreate.settings.message.guide"
                  components={[
                    <Link
                      key="link"
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="none"
                    />,
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
            <Stack
              sx={{ whiteSpace: 'nowrap' }}
              direction="row"
              gap={1}
              color="primary.main"
            >
              <PreviewIcon />
              <Link>{t('debtTypeCreate.settings.preview')}</Link>
            </Stack>
          </Stack>
        </SectionBox>
      </WizardStepWrapper>
      <WizardStepButtons
        onBack={onBack}
        nextLabel={t('commons.create')}
        onNext={handleSubmit(onSubmit)}
      />
    </form>
  );
};
