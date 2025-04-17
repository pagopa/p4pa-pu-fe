import { Box, Button, Stack } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useNavigate, useParams } from 'react-router-dom';
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
import debtPositions from '../../api/debtPositions';
import { PageRoutes } from '../../App';

export const DebtTypeCatalogDetailView = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [accordionSections, setAccordionSections] = useState<
    Array<AccordionSectionConfig>
  >([]);
  const { state } = useStore();
  const { t } = useTranslation();
  const { debtPositionTypeId } = useParams<{ debtPositionTypeId: string }>();
  const navigate = useNavigate();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const deleteDebtPositionType = debtPositions.deleteDebtPositionType(
    Number(debtPositionTypeId),
    () => navigate(PageRoutes.DEBT_TYPES_CATALOG),
    (error) => {
      console.error(error);
      setOpenErrorDialog(true);
    }
  );

  if (isNaN(Number(debtPositionTypeId))) {
    // TODO
    // raise error
    console.error('debtPositionTypeId is not a number');
  }

  const { data } = getDebtPositionTypeDetail({
    organizationId,
    debtPositionTypeId: Number(debtPositionTypeId)
  });

  useEffect(() => {
    if (data) {
      const sections = getAccordionSectionsConfig(data, t) || [];
      setAccordionSections(sections);
    }
  }, [data]);

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

  const handleDeleteConfirm = async () => {
    setOpenDeleteDialog(false);
    deleteDebtPositionType.mutate();
  };

  const handleErrorConfirm = () => {
    setOpenErrorDialog(false);
  };

  return (
    <>
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
