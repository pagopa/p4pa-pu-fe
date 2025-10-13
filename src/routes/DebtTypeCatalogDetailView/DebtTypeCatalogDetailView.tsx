import { Box, Button, Stack } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { generatePath, useNavigate, useParams } from 'react-router';
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
import { PageRoutes } from '../../routes';
import { isAxiosError } from 'axios';

export const DebtTypeCatalogDetailView = () => {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [ErrorDescription, setErrorDescription] = useState<
    'genericErrorDescription' | 'alreadyUsedDescription'
  >('genericErrorDescription');
  const [accordionSections, setAccordionSections] = useState<
    Array<AccordionSectionConfig>
  >([]);
  const { state } = useStore();
  const { t } = useTranslation();
  const { debtPositionTypeId } = useParams<{ debtPositionTypeId: string }>();
  const navigate = useNavigate();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

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
      onActionClick: () =>
        navigate(
          generatePath(PageRoutes.DEBT_TYPE_CATALOG_EDIT, {
            debtPositionTypeId: debtPositionTypeId
          })
        )
    }
  ];

  const deleteDebtPositionType = debtPositions.deleteDebtPositionType(
    Number(debtPositionTypeId)
  );

  const handleDeleteConfirm = async () => {
    setOpenDeleteDialog(false);
    try {
      await deleteDebtPositionType.mutateAsync();
      navigate(PageRoutes.RESPONSES_SUCCESS, {
        replace: true,
        state: {
          category: 'debt-type-delete-success',
          i18nParams: {
            description: data?.description
          }
        }
      });
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

  return (
    <>
      <>
        <TitleComponent
          title={data?.description ?? '-'}
          description={t('debtTypeCatalogDetail.description')}
          callToAction={actionButtons}
          accessibleTitle={t('debtTypeCatalogDetail.accessibleTitle', {
            description: data?.description,
            interpolation: { escapeValue: false }
          })}
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

export default DebtTypeCatalogDetailView;
