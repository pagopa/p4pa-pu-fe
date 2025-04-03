import { Box, Button, CircularProgress, Stack } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useParams } from 'react-router-dom';
import { DetailAccordion } from '../../components/DetailAccordion/DetailAccordion';
import {
  AccordionSectionConfig,
  getAccordionSectionsConfig
} from '../../models/DebtTypeCatalogSectionsConfig';
import { useEffect, useState } from 'react';
import GenericDialog from '../../components/GenericDialog/GenericDialog';
import { STATE } from '../../store/types';
import { useStore } from '../../store/GlobalStore';
import { getDebtPositionTypeDetail } from '../../api/debtPositionTypeDetail';

export const DebtTypeCatalogDetailView = () => {
  const { t } = useTranslation();
  const [accordionSections, setAccordionSections] = useState<
    Array<AccordionSectionConfig>
  >([]);

  const { debtPositionTypeId } = useParams<{ debtPositionTypeId: string }>();
  const { state } = useStore();

  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  if (isNaN(Number(debtPositionTypeId))) {
    // TODO
    // raise error
    console.error('debtPositionTypeId is not a number');
  }

  const { data, isLoading } = getDebtPositionTypeDetail({
    organizationId,
    debtPositionTypeId: Number(debtPositionTypeId)
  });

  useEffect(() => {
    if (!isLoading && data) {
      const sections = getAccordionSectionsConfig(data, t) || [];
      setAccordionSections(sections);
    }
  }, [data, isLoading]);

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
      {!isLoading && (
        <>
          <TitleComponent
            title={data?.description ?? '-'}
            description={t('debtTypeCatalogDetail.description')}
            callToAction={actionButtons}
          />
          <Box mt={3}>
            <Stack spacing={2}>
              {accordionSections?.map((section, index) => (
                <DetailAccordion
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
        </>
      )}
      {isLoading && <CircularProgress />}

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
