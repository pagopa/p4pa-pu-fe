import { useState, MouseEvent } from 'react';
import { Close, Delete, MoreVert } from '@mui/icons-material';
import { Button, Menu, MenuItem } from '@mui/material';
import {
  AssessmentsRowsDetail,
  AssessmentStatus
} from '../../../generated/core/data-contracts';
import { useParams } from 'react-router';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';
import { updateAssessmentsStatus } from '../../api/assessments';
import utils from '../../utils';
import { useTranslation } from 'react-i18next';

export type Props = {
  status?: AssessmentsRowsDetail['status'];
  flagManualGeneration?: AssessmentsRowsDetail['flagManualGeneration'];
};

const AssessmentActionMenu = (props: Props) => {
  const { status, flagManualGeneration } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { id } = useParams<{ id: string }>();
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const { t } = useTranslation();
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const updateAssessmentMutation = updateAssessmentsStatus(organizationId);

  const updateAssessment = async (status: AssessmentStatus) => {
    try {
      await updateAssessmentMutation.mutateAsync({
        assessmentId: Number(id),
        status
      });
      location.reload();
    } catch (e) {
      console.error(e);
      utils.notify.emit(t('errors.generic'));
      setAnchorEl(null);
    }
  };

  const closeAssessment = () => updateAssessment(AssessmentStatus.CLOSED);
  const cancelAssessment = () => updateAssessment(AssessmentStatus.CANCELLED);

  const confirmCloseAssessment = () => {
    utils.dialog.open({
      'data-testid': 'confirm-close-dialog',
      title: t('assessmentDetail.closeDialog.title'),
      message: t('assessmentDetail.closeDialog.description'),
      confirmLabel: t('assessmentDetail.closeDialog.ok'),
      cancelLabel: t('assessmentDetail.closeDialog.ko'),
      onConfirm: closeAssessment,
      onClose: handleClose
    });
  };

  const confirmCancelAssessment = () => {
    utils.dialog.open({
      'data-testid': 'confirm-cancel-dialog',
      title: t('assessmentDetail.cancelDialog.title'),
      message: t('assessmentDetail.cancelDialog.description'),
      confirmLabel: t('assessmentDetail.cancelDialog.ok'),
      cancelLabel: t('assessmentDetail.cancelDialog.ko'),
      onConfirm: cancelAssessment,
      onClose: handleClose
    });
  };

  return status !== AssessmentStatus.CANCELLED && flagManualGeneration ? (
    <>
      <Button
        data-testid="assessment-action-menu"
        onClick={handleClick}
        size="large"
        sx={{ bgcolor: 'primary.contrastText' }}
      >
        <MoreVert color="primary" data-testid="MoreVertIcon" />
      </Button>

      <Menu
        onClose={handleClose}
        open={open}
        anchorEl={anchorEl}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1
              }
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {status === AssessmentStatus.ACTIVE && (
          <MenuItem
            onClick={confirmCloseAssessment}
            data-testid="assessment-action-close"
          >
            <Close fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            {t('commons.close')}
          </MenuItem>
        )}
        {(status === AssessmentStatus.ACTIVE ||
          status === AssessmentStatus.CLOSED) && (
          <MenuItem
            onClick={confirmCancelAssessment}
            data-testid="assessment-action-delete"
          >
            <Delete fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
            {t('commons.delete')}
          </MenuItem>
        )}
      </Menu>
    </>
  ) : null;
};

export default AssessmentActionMenu;
