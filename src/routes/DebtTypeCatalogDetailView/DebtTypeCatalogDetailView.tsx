import { Box, Button, Stack } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useLocation } from 'react-router-dom';
import DebtTypeAccordionSection from '../../components/DetailAccordion/DetailAccordion';
import { accordionSectionsConfig } from '../../models/DebtTypeCatalogSectionsConfig';
import { useState } from 'react';
import GenericDialog from '../../components/GenericDialog/GenericDialog';

export const DebtTypeCatalogDetailView = () => {
  const { t } = useTranslation();

  const mockData = {
    debtPositionTypeId: 3,
    code: 'XC1024',
    description: 'Test Debt Position Type',
    organizationTypeDescription: "PROVINCIA / CITTA' METROPOLITANA",
    macroAreaName: "SERVIZI PROVINCIALI / CITTA' METROPOLITANA",
    serviceType: 'Riscossione Coattiva',
    collectionReason: 'TARI',
    taxonomyCode: '9/0201139AP/',
    flagAnonymousFiscalCode: true,
    flagMandatoryDueDate: true,
    flagNotifyIo: true,
    ioTemplateMessage: 'Template for IO Notifications'
  };

  const accordionSections = accordionSectionsConfig(mockData);

  const { debtTypeName } = (useLocation().state || {}) as {
    debtTypeName: string;
  };

  const actionButtons = [
    {
      icon: <Delete />,
      buttonText: t('commons.delete'),
      color: 'error' as const,
      variant: 'outlined' as const,
      onActionClick: () => setOpenDeleteDialog(true)
    },
    {
      icon: <Edit />,
      buttonText: t('commons.edit'),
      color: 'primary' as const,
      variant: 'contained' as const,
      onActionClick: () => console.log('edit')
    }
  ];

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);

  const handleDeleteConfirm = () => {
    setOpenDeleteDialog(false);
    //TODO add error handling
    setOpenErrorDialog(true);
  };

  const handleErrorConfirm = () => {
    setOpenErrorDialog(false);
  };

  return (
    <>
      <TitleComponent
        title={debtTypeName}
        description={t('debtTypeCatalogDetail.description')}
        callToAction={actionButtons}
      />
      <Box mt={3}>
        <Stack spacing={2}>
          {accordionSections.map((section, index) => (
            <DebtTypeAccordionSection
              key={section.configType}
              idTitle={++index}
              title={section.title}
              description={section.description}
              sections={section.sections}
            />
          ))}
        </Stack>
      </Box>
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Stack spacing={2} direction="row">
          {actionButtons.map((button, index) => (
            <Button
              size="large"
              key={index}
              startIcon={button.icon}
              color={button.color}
              variant={button.variant}
              onClick={button.onActionClick}
            >
              {button.buttonText}
            </Button>
          ))}
        </Stack>
      </Box>

      <GenericDialog
        data-testid="confirm-dialog"
        open={openDeleteDialog}
        title={t('debtTypeCatalogDetail.confirmDialog.title')}
        message={t('debtTypeCatalogDetail.confirmDialog.description')}
        confirmLabel={t('commons.delete')}
        cancelLabel={t('commons.close')}
        onConfirm={handleDeleteConfirm}
        onClose={() => setOpenDeleteDialog(false)}
      />
      <GenericDialog
        data-testid="error-dialog"
        open={openErrorDialog}
        title={t('debtTypeCatalogDetail.errorDialog.title')}
        message={t('debtTypeCatalogDetail.errorDialog.genericErrorDescription')}
        confirmLabel={t('commons.close')}
        onConfirm={handleErrorConfirm}
        onClose={() => setOpenErrorDialog(false)}
      />
    </>
  );
};

export default DebtTypeCatalogDetailView;
