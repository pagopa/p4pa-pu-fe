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
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const mandatoryFields: Partial<Record<keyof OrganizationDetailDTO, string>> =
    {
      iban: t('commons.iban'),
      orgLogo: t('organizations.orgLogo'),
      segregationCode: t('commons.segregationCode')
    };
  const missingKeys = (
    Object.keys(mandatoryFields) as Array<keyof OrganizationDetailDTO>
  )
    .filter((key) => !(key in organizationDetailData))
    .map((key) => mandatoryFields[key] ?? key);

  const emptyFieldsString = missingKeys.join(', ');

  useEffect(() => {
    if (missingKeys.length > 0) setShowAlert(true);
  }, [missingKeys]);

  const editButton: ReactNode = (
    <Button startIcon={<EditIcon />} onClick={editFunction}>
      {t('organizations.editOrg')}
    </Button>
  );

  return (
    <>
      {showAlert && (
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
