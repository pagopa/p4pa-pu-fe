import { Box, Button, Stack } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailAccordion } from '../../components/DetailAccordion/DetailAccordion';
import {
  AccordionSectionConfig,
  getAccordionSectionsConfig
} from '../../models/DebtTypeSectionsConfig';
import { useEffect, useState } from 'react';
import { STATE } from '../../store/types';
import { getDebtPositionTypeOrgById } from '../../api/debtPositionsTypeOrg';
import utils from '../../utils';
import debtPositions from '../../api/debtPositions';
import { PageRoutes } from '../../App';
import GenericDialog from '../../components/GenericDialog/GenericDialog';
import { isAxiosError } from 'axios';
import { useStore } from '../../store/GlobalStore';

export const DebtTypeDetailView = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [ErrorDescription, setErrorDescription] = useState<
    'genericErrorDescription' | 'alreadyUsedDescription'
  >('genericErrorDescription');
  const navigate = useNavigate();
  const [accordionSections, setAccordionSections] = useState<
    Array<AccordionSectionConfig>
  >([]);
  const { state } = useStore();
  const { t } = useTranslation();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const { debtPositionTypeOrgId } = useParams<{
    debtPositionTypeOrgId: string;
  }>();

  const deleteDebtPositionTypeOrgs = debtPositions.deleteDebtPositionTypeOrgs(
    organizationId,
    Number(debtPositionTypeOrgId)
  );
  const handleDeleteConfirm = async () => {
    setOpenDeleteDialog(false);
    try {
      await deleteDebtPositionTypeOrgs.mutateAsync();
      navigate(PageRoutes.DEBT_TYPES);
    } catch (error: unknown) {
      setOpenErrorDialog(true);
      if (isAxiosError(error) && error.response?.status === 409) {
        return setErrorDescription('alreadyUsedDescription');
      }
      setErrorDescription('genericErrorDescription');
    }
  };

  const handleErrorConfirm = () => {
    setOpenErrorDialog(false);
  };

  if (isNaN(Number(debtPositionTypeOrgId))) {
    // TODO
    // raise error
    console.error('debtPositionTypeOrgId is not a number');
  }

  const { data, isLoading, isError, isSuccess } = getDebtPositionTypeOrgById({
    organizationId,
    debtPositionTypeOrgId: Number(debtPositionTypeOrgId)
  });

  useEffect(() => {
    if (isSuccess && data) {
      const sections = getAccordionSectionsConfig(data, t) || [];
      setAccordionSections(sections);
    }
    if (isError) {
      utils.notify.emit(t('errors.fetchDebtPositionsTypes'), 'error');
    }
  }, [data, isLoading, isError, isSuccess]);

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
      onActionClick: () => console.log('onActionClick edit')
    }
  ];

  return (
    <>
      <>
        <TitleComponent
          title={data?.description ?? '-'}
          description={t('debtTypeDetail.description')}
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
        message={t(`debtTypeCatalogDetail.errorDialog.${ErrorDescription}`)}
        confirmLabel={t('commons.close')}
        onConfirm={handleErrorConfirm}
        onClose={() => setOpenErrorDialog(false)}
      />
    </>
  );
};

export default DebtTypeDetailView;
