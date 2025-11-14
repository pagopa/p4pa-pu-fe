import { Alert, AlertTitle, Button, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OrganizationDetailDTO } from '../../../../generated/data-contracts';

type OrganizationDetailAlertProps = {
  editFunction: () => void;
  organizationDetailData: OrganizationDetailDTO;
};

export const OrganizationDetailAlert: React.FC<
  OrganizationDetailAlertProps
> = ({
  editFunction,
  organizationDetailData
}: OrganizationDetailAlertProps) => {
  const { t } = useTranslation();
  const [emptyFieldsString, setEmptyFieldsString] = useState<string>('');

  const mandatoryFields: Partial<Record<keyof OrganizationDetailDTO, string>> =
    {
      iban: t('commons.iban'),
      orgLogo: t('organizations.orgLogo'),
      segregationCode: t('commons.segregationCode')
    };

  useEffect(() => {
    // create an error bucket if a mandatory key missing in data or exists with an empty value
    const missingKeys = (
      Object.keys(mandatoryFields) as Array<keyof OrganizationDetailDTO>
    )
      .filter((key) => {
        const value = organizationDetailData[key];
        return !(key in organizationDetailData) || value === '';
      })
      .map((key) => mandatoryFields[key] ?? key);
    setEmptyFieldsString(missingKeys.join(', '));
  }, [organizationDetailData]);

  const editButton: ReactNode = (
    <Button startIcon={<EditIcon />} onClick={editFunction}>
      {t('organizations.editOrg')}
    </Button>
  );

  return (
    <>
      {emptyFieldsString && (
        <Alert
          severity="info"
          data-testid="org-empty-fields-error"
          action={editButton}
        >
          <AlertTitle>{t('organizations.alertTitle')}</AlertTitle>
          <Typography variant={'body2'}>
            {t('organizations.alertBody', {
              emptyFields: emptyFieldsString,
              interpolation: { escapeValue: false }
            })}
          </Typography>
        </Alert>
      )}
    </>
  );
};

export default OrganizationDetailAlert;
