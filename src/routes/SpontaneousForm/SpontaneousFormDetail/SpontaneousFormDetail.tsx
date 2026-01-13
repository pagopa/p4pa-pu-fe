import { useState } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router';
import { AxiosError } from 'axios';
import { useStore } from '../../../store/GlobalStore';
import spontaneousFormApi from '../../../api/spontaneousForm';
import DetailContainer, {
  DetailSectionProps
} from '../../../components/DetailContainer/DetailContainer';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import GenericDialog from '../../../components/GenericDialog/GenericDialog';
import { SpontaneousFormDetailDTO } from '../../../../generated/data-contracts';
import utils from '../../../utils';
import { PageRoutes } from '../..';

const SpontaneousFormDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { spontaneousFormId } = useParams<{ spontaneousFormId: string }>();

  const {
    state: { organizationId }
  } = useStore();

  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const { data, isLoading } = spontaneousFormApi.getSpontaneousFormById({
    organizationId: Number(organizationId),
    spontaneousFormId: Number(spontaneousFormId)
  });

  const deleteMutation = spontaneousFormApi.deleteSpontaneousForm({
    organizationId: Number(organizationId)
  });

  const formDetail: SpontaneousFormDetailDTO | undefined = data?.response;

  const hasStructure = Boolean(formDetail?.structure?.fields?.length);
  const hasDictionary = Boolean(
    formDetail?.dictionary && Object.keys(formDetail.dictionary).length > 0
  );

  const handleDeleteClick = async () => {
    if (!formDetail?.spontaneousFormId) return;

    try {
      await deleteMutation.mutateAsync(formDetail.spontaneousFormId);
      utils.notify.emit(t('spontaneousForm.detail.deleteSuccess'), 'success');
      navigate(generatePath(PageRoutes.SPONTANEOUS_FORM_INDEX));
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        setErrorDialogOpen(true);
      } else {
        utils.notify.emit(t('spontaneousForm.detail.deleteError'), 'error');
      }
    }
  };

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
  };

  const sections: DetailSectionProps['sections'] = [
    {
      title: {
        label: t('spontaneousForm.detail.formConfiguration'),
        variant: 'h6'
      },
      data: []
    },
    {
      title: {
        label: t('spontaneousForm.detail.generalConfiguration'),
        variant: 'subtitle1'
      },
      data: [
        {
          label: t('spontaneousForm.detail.identificationCode'),
          value: formDetail?.code
        },
        {
          label: t('spontaneousForm.detail.structure'),
          value: hasStructure ? t('spontaneousForm.detail.jsonCode') : undefined
        }
      ],
      inline: true,
      inlineSizeFirstElement: 4
    },
    {
      title: {
        label: t('spontaneousForm.detail.translations'),
        variant: 'subtitle1'
      },
      data: [
        {
          label: t('spontaneousForm.detail.dictionary'),
          value: hasDictionary
            ? t('spontaneousForm.detail.jsonCode')
            : undefined
        }
      ],
      inline: true,
      inlineSizeFirstElement: 4
    },
    {
      title: {
        label: t('spontaneousForm.detail.inUse'),
        variant: 'subtitle1'
      },
      data: [
        {
          label: t('spontaneousForm.detail.debtPositionTypeOrgCount'),
          value: formDetail?.debtPositionTypeOrgCount
        }
      ],
      inline: true,
      inlineSizeFirstElement: 4
    }
  ];

  if (isLoading) {
    return null;
  }

  return (
    <>
      <TitleComponent
        title={formDetail?.code ?? ''}
        description={t('spontaneousForm.detail.description')}
      />
      <Box sx={{ mt: 3 }}>
        <DetailContainer sections={sections} fullWidthSections />
      </Box>
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Stack spacing={2} direction="row">
          <Button
            size="large"
            startIcon={<Delete />}
            color="error"
            variant="outlined"
            disabled={deleteMutation.isPending}
            onClick={handleDeleteClick}
            data-testid="delete-button"
          >
            {t('commons.delete')}
          </Button>
          <Button
            size="large"
            startIcon={<Edit />}
            color="primary"
            variant="contained"
            data-testid="edit-button"
          >
            {t('commons.edit')}
          </Button>
        </Stack>
      </Box>

      <GenericDialog
        open={errorDialogOpen}
        title={t('spontaneousForm.detail.cannotDeleteTitle')}
        message={t('spontaneousForm.detail.cannotDeleteMessage')}
        confirmLabel={t('commons.close')}
        onConfirm={handleErrorDialogClose}
        onClose={handleErrorDialogClose}
        data-testid="error-dialog"
      />
    </>
  );
};

export default SpontaneousFormDetail;
