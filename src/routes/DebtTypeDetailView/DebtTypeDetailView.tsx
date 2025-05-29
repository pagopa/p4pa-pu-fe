import { Box, Button, Stack } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useNavigate, useParams } from 'react-router-dom';
import { DetailAccordion } from '../../components/DetailAccordion/DetailAccordion';
import {
  AccordionSectionConfig,
  getAccordionSectionsConfig,
  OperatorsData
} from '../../models/DebtTypeSectionsConfig';
import { useEffect, useState } from 'react';
import { STATE } from '../../store/types';
import { getDebtPositionTypeOrgById } from '../../api/debtPositionsTypeOrg';
import utils from '../../utils';
import debtPositions from '../../api/debtPositions';
import { PageRoutes } from '../../App';
import GenericDialog from '../../components/GenericDialog/GenericDialog';
import { AxiosError, isAxiosError } from 'axios';
import { useStore } from '../../store/GlobalStore';
import { getDebtPositionTypeOrgOperators } from '../../api/debtPositionTypeOrgOperators';
import { useDebtPositionTypeOrgSearch } from '../../api/debtTypesCreated';

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

  const {
    data,
    isLoading,
    isError: isDebtTypeError,
    isSuccess,
    error: debtTypeError
  } = getDebtPositionTypeOrgById({
    organizationId,
    debtPositionTypeOrgId: Number(debtPositionTypeOrgId)
  });

  const {
    data: operatorsData,
    isError: isOperatorsError,
    error: operatorsError
  } = getDebtPositionTypeOrgOperators(organizationId, {
    debtPositionTypeOrgId: Number(debtPositionTypeOrgId)
  });

  const {
    data: operatorsEnabledData,
    mutate,
    isError: isOperatorsEnabledError,
    error: operatorsEnabledError
  } = useDebtPositionTypeOrgSearch();

  const buildOperatorsData = (): OperatorsData | null => {
    if (!operatorsData || !operatorsEnabledData?.content?.[0]) {
      return null;
    }

    const totalOperators = operatorsData.totalElements;
    const enabledOperators =
      operatorsEnabledData.content[0].enabledOperators || 0;

    return {
      totalOperators,
      enabledOperators
    };
  };

  useEffect(() => {
    if (isSuccess && data) {
      const operatorsInfo = buildOperatorsData();
      const sections = getAccordionSectionsConfig(data, operatorsInfo, t) || [];
      setAccordionSections(sections);
    }

    if (isDebtTypeError && debtTypeError) {
      const axiosError = debtTypeError as AxiosError;
      const isServerError =
        axiosError?.response?.status && axiosError.response.status >= 500;

      if (!isServerError) {
        utils.notify.emit(t('errors.fetchDebtPositionsTypes'), 'error');
      }
    }

    if (isOperatorsError && operatorsError) {
      utils.notify.emit(t('errors.fetchOperators'), 'error');
    }

    if (isOperatorsEnabledError && operatorsEnabledError) {
      utils.notify.emit(t('errors.fetchOperatorsEnabled'), 'error');
    }
  }, [
    data,
    isLoading,
    isSuccess,
    operatorsData,
    operatorsEnabledData,
    isDebtTypeError,
    debtTypeError,
    isOperatorsError,
    operatorsError,
    isOperatorsEnabledError,
    operatorsEnabledError
  ]);

  useEffect(() => {
    if (!isLoading && isSuccess && data?.code && !operatorsEnabledData) {
      mutate({
        organizationId,
        filters: {
          code: data.code,
          description: data.description
        }
      });
    }
  }, [isLoading, isSuccess, data, operatorsEnabledData, mutate]);

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
