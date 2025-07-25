import { useState, MouseEvent } from 'react';
import { Close, Delete, MoreVert } from '@mui/icons-material';
import { Button, Menu, MenuItem } from '@mui/material';
import {
  AssessmentsRowsDetail,
  AssessmentStatus
} from '../../../../generated/data-contracts';
import { useParams } from 'react-router';
import { useStore } from '../../../store/GlobalStore';
import { STATE } from '../../../store/types';
import { updateAssessmentsStatus } from '../../../api/assessments';
import utils from '../../../utils';
import { useTranslation } from 'react-i18next';

type Props = {
  status?: AssessmentsRowsDetail['status'];
};

const AssesmentActionMenu = (props: Props) => {
  const { status } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { id } = useParams<{ id: string }>();
  const { state } = useStore();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);
  const { t } = useTranslation();
  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const updateAssessmentMutation = updateAssessmentsStatus(organizationId);

  const updateAssessment = async (status: AssessmentStatus) => {
    try {
      await updateAssessmentMutation.mutateAsync({
        assessmentId: Number(id),
        status
      });
      location.reload();
    } catch {
      utils.notify.emit('errore');
    }
  };

  const cancelAssessment = () => updateAssessment(AssessmentStatus.CANCELLED);
  const closeAssessment = () => updateAssessment(AssessmentStatus.CLOSED);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggle = (event: MouseEvent<HTMLElement>) =>
    anchorEl === null ? handleOpen(event) : handleClose();

  return status !== AssessmentStatus.CANCELLED ? (
    <>
      <Button
        onClick={toggle}
        size="large"
        sx={{ bgcolor: 'primary.contrastText' }}
      >
        <MoreVert color="primary" />
      </Button>

      <Menu
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
            onClick={closeAssessment}
            data-testid="assessment-close-button"
          >
            <Close fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            {t('commons.close')}
          </MenuItem>
        )}
        {(status === AssessmentStatus.ACTIVE ||
          status === AssessmentStatus.CLOSED) && (
          <MenuItem
            onClick={cancelAssessment}
            data-testid="assessment-delete-button"
          >
            <Delete fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
            {t('commons.delete')}
          </MenuItem>
        )}
      </Menu>
    </>
  ) : null;
};

export default AssesmentActionMenu;
