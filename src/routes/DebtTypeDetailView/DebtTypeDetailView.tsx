import {
  Box,
  Button,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Delete,
  Edit,
  MoreVert,
  HighlightOff,
  Check
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { generatePath, useNavigate, useParams } from 'react-router';
import { DetailAccordion } from '../../components/DetailAccordion/DetailAccordion';
import {
  AccordionSectionConfig,
  getAccordionSectionsConfig,
  OperatorsData
} from '../../models/DebtTypeSectionsConfig';
import { useEffect, useState, useMemo } from 'react';
import { STATE } from '../../store/types';
import {
  getDebtPositionTypeOrgById,
  updateFlagActiveDebtPositionTypeOrg
} from '../../api/debtPositionsTypeOrg';
import utils from '../../utils';
import debtPositions from '../../api/debtPositions';
import { PageRoutes } from '../../routes';
import GenericDialog from '../../components/GenericDialog/GenericDialog';
import { AxiosError, isAxiosError } from 'axios';
import { useStore } from '../../store/GlobalStore';
import { useDebtPositionTypeOrgSearch } from '../../api/debtTypesCreated';
import { OrgSilServiceType } from '../../../generated/data-contracts';
import { theme } from '@pagopa/mui-italia';
import { useConfirmDialog } from './hooks/useConfirmDialog';
import { getDebtPositionTypeOrgOperators } from '../../api/debtPositionTypeOrgOperators';

export const DebtTypeDetailView = () => {
  const {
    isOpen,
    currentAction,
    closeDialog,
    handleConfirm,
    showDeleteDialog,
    showDisableDialog,
    showEnableDialog,
    showErrorDialog
  } = useConfirmDialog();

  const [actionMenuAnchorEl, setActionMenuAnchorEl] =
    useState<null | HTMLElement>(null);
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

  const updateFlagActive = updateFlagActiveDebtPositionTypeOrg(
    () => {
      utils.notify.emit(t('debtTypeDetail.success.updated'), 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    () => {
      showErrorDialog('genericErrorDescription');
    }
  );

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

  const operatorQuery = getDebtPositionTypeOrgOperators(organizationId);

  useEffect(() => {
    if (isSuccess && data?.response && operatorQuery?.isIdle) {
      operatorQuery.mutate({
        filters: { debtPositionTypeOrgId: Number(debtPositionTypeOrgId) },
        pagination: { page: 0, size: 10 },
        sort: []
      });
    }
  }, [isSuccess, data]);

  const {
    data: operatorsEnabledData,
    mutate,
    isError: isOperatorsEnabledError,
    error: operatorsEnabledError
  } = useDebtPositionTypeOrgSearch(organizationId);

  const handleDeleteClick = () => {
    handleActionMenuClose();
    showDeleteDialog(async () => {
      try {
        await deleteDebtPositionTypeOrgs.mutateAsync();
        navigate(PageRoutes.RESPONSES_SUCCESS, {
          replace: true,
          state: {
            category: 'debt-type-org-delete-success',
            i18nParams: {
              description: data?.response?.description
            }
          }
        });
      } catch (error: unknown) {
        if (isAxiosError(error) && error.response?.status === 409) {
          showErrorDialog('alreadyUsedDescription');
        } else {
          showErrorDialog('genericErrorDescription');
        }
        throw error;
      }
    });
  };

  const handleDisableClick = () => {
    handleActionMenuClose();
    showDisableDialog(async () => {
      try {
        await updateFlagActive.mutateAsync({
          organizationId,
          debtPositionTypeOrgId: Number(debtPositionTypeOrgId),
          flagActive: false
        });
      } catch (error: unknown) {
        console.error('Disable error:', error);
      }
    });
  };

  const handleEnableClick = () => {
    showEnableDialog(async () => {
      try {
        await updateFlagActive.mutateAsync({
          organizationId,
          debtPositionTypeOrgId: Number(debtPositionTypeOrgId),
          flagActive: true
        });
      } catch (error: unknown) {
        console.error('Enable error:', error);
        utils.notify.emit(t('debtTypeDetail.errors.enableFailed'), 'error');
      }
    });
  };

  const handleDirectDeleteClick = () => {
    showDeleteDialog(async () => {
      try {
        await deleteDebtPositionTypeOrgs.mutateAsync();
        navigate(PageRoutes.RESPONSES_SUCCESS, {
          replace: true,
          state: {
            category: 'debt-type-org-delete-success',
            i18nParams: {
              description: data?.response?.description
            }
          }
        });
      } catch (error: unknown) {
        if (isAxiosError(error) && error.response?.status === 409) {
          showErrorDialog('alreadyUsedDescription');
        } else {
          showErrorDialog('genericErrorDescription');
        }
        throw error;
      }
    });
  };

  const handleEditClick = async () => {
    try {
      const notificationPromise = utils.apiClient.bff.getOrgSilServices(
        organizationId,
        { serviceType: OrgSilServiceType.PAID_NOTIFICATION_OUTCOME }
      );
      const actualizationPromise = utils.apiClient.bff.getOrgSilServices(
        organizationId,
        { serviceType: OrgSilServiceType.ACTUALIZATION }
      );

      await Promise.all([notificationPromise, actualizationPromise]);

      navigate(
        generatePath(PageRoutes.DEBT_TYPE_ORG_EDIT, {
          debtPositionTypeOrgId
        })
      );
    } catch (error) {
      console.error('Services availability check failed:', error);
      utils.notify.emit(
        t('debtTypeDetail.errors.servicesUnavailableCannotEdit'),
        'error'
      );
    }
  };

  const handleActionMenuOpen = () => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      setActionMenuAnchorEl(activeElement);
    }
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchorEl(null);
  };

  if (isNaN(Number(debtPositionTypeOrgId))) {
    console.error('debtPositionTypeOrgId is not a number');
  }

  const buildOperatorsData = (): OperatorsData | null => {
    if (!operatorQuery.data || !operatorsEnabledData?.content?.[0]) {
      return null;
    }

    const totalOperators = operatorQuery.data.totalElements;
    const enabledOperators =
      operatorsEnabledData.content[0].enabledOperators || 0;

    return {
      totalOperators,
      enabledOperators
    };
  };

  const { titleActions, bottomActions } = useMemo(() => {
    const isActive = data?.response?.flagActive;

    // no buttons it the org used != org owned
    if (data?.response.organizationId !== organizationId) {
      return {
        titleActions: [],
        bottomActions: []
      };
    }

    if (isActive) {
      const actionMenuButton = {
        icon: <MoreVert />,
        color: 'primary' as const,
        disabled: false,
        onActionClick: handleActionMenuOpen,
        dataTestId: 'action-menu-button',
        isIconButton: true
      };

      const editButton = {
        icon: <Edit />,
        buttonText: t('commons.edit'),
        color: 'primary' as const,
        variant: 'contained' as const,
        dataTestId: 'action-edit-button',
        disabled: false,
        onActionClick: handleEditClick
      };

      return {
        titleActions: [actionMenuButton, editButton],
        bottomActions: [editButton]
      };
    } else {
      const deleteButton = {
        icon: <Delete />,
        buttonText: t('commons.delete'),
        color: 'error' as const,
        variant: 'outlined' as const,
        disabled: false,
        onActionClick: handleDirectDeleteClick
      };

      const canEnable =
        data?.response?.debtPositionTypeId != undefined &&
        data.response.debtPositionTypeId >= 0;

      if (canEnable) {
        const enableButton = {
          icon: <Check />,
          buttonText: t('commons.enable'),
          color: 'primary' as const,
          variant: 'contained' as const,
          disabled: false,
          onActionClick: handleEnableClick
        };

        return {
          titleActions: [deleteButton, enableButton],
          bottomActions: [deleteButton, enableButton]
        };
      }

      return {
        titleActions: [deleteButton],
        bottomActions: [deleteButton]
      };
    }
  }, [data?.response?.flagActive, t]);

  const getStatusChip = () => {
    if (data?.response?.flagActive) {
      return { label: t('commons.enabled'), color: 'success' as const };
    }
    return { label: t('commons.disabled'), color: 'error' as const };
  };

  useEffect(() => {
    if (isSuccess && data?.response) {
      const operatorsInfo = buildOperatorsData();
      const sections =
        getAccordionSectionsConfig(data?.response, operatorsInfo, t) || [];
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

    if (operatorQuery.isError) {
      utils.notify.emit(t('errors.fetchOperators'), 'error');
    }

    if (isOperatorsEnabledError && operatorsEnabledError) {
      utils.notify.emit(t('errors.fetchOperatorsEnabled'), 'error');
    }
  }, [
    data,
    isLoading,
    isSuccess,
    operatorQuery.data,
    operatorsEnabledData,
    isDebtTypeError,
    debtTypeError,
    operatorQuery.isError,
    isOperatorsEnabledError,
    operatorsEnabledError,
    t
  ]);

  useEffect(() => {
    if (
      !isLoading &&
      isSuccess &&
      data?.response?.code &&
      !operatorsEnabledData
    ) {
      mutate({
        filters: {
          code: data.response.code,
          description: data.response.description
        },
        pagination: { page: 0, size: 10 },
        sort: []
      });
    }
  }, [
    isLoading,
    isSuccess,
    data,
    operatorsEnabledData,
    mutate,
    organizationId
  ]);

  return (
    <>
      <TitleComponent
        title={data?.response?.description ?? '-'}
        chip={getStatusChip()}
        description={t('debtTypeDetail.description')}
        callToAction={titleActions}
        accessibleTitle={t('debtTypeDetail.accessibleTitle', {
          description: data?.response?.description,
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
          {bottomActions.map((button, index) => (
            <Button
              size="large"
              key={index}
              startIcon={button.icon}
              color={button.color}
              variant={button.variant}
              disabled={button.disabled}
              onClick={button.onActionClick}
            >
              {button.buttonText}
            </Button>
          ))}
        </Stack>
      </Box>

      {data?.response?.flagActive && (
        <Menu
          anchorEl={actionMenuAnchorEl}
          open={Boolean(actionMenuAnchorEl)}
          onClose={handleActionMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <MenuItem onClick={handleDisableClick}>
            <ListItemIcon>
              <HighlightOff
                fontSize="small"
                sx={{ color: theme.palette.primary.main }}
              />
            </ListItemIcon>
            <ListItemText>{t('commons.disable')}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon>
              <Delete
                fontSize="small"
                sx={{ color: theme.palette.error.main }}
              />
            </ListItemIcon>
            <ListItemText>{t('commons.delete')}</ListItemText>
          </MenuItem>
        </Menu>
      )}

      {currentAction && (
        <GenericDialog
          data-testid={currentAction.testId}
          open={isOpen}
          title={currentAction.title}
          message={currentAction.message}
          confirmLabel={currentAction.confirmLabel}
          cancelLabel={
            currentAction.showCancel ? currentAction.cancelLabel : undefined
          }
          onConfirm={handleConfirm}
          onClose={closeDialog}
        />
      )}
    </>
  );
};

export default DebtTypeDetailView;
