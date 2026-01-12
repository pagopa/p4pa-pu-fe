import { Box, Button, Stack } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useStore } from '../../../store/GlobalStore';
import spontaneousFormApi from '../../../api/spontaneousForm';
import DetailContainer, {
  DetailSectionProps
} from '../../../components/DetailContainer/DetailContainer';
import TitleComponent from '../../../components/TitleComponent/TitleComponent';
import { SpontaneousFormDetailDTO } from '../../../../generated/data-contracts';

const SpontaneousFormDetail = () => {
  const { t } = useTranslation();
  const { spontaneousFormId } = useParams<{ spontaneousFormId: string }>();

  const {
    state: { organizationId }
  } = useStore();

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

  const actionButtons = [
    {
      icon: <Delete />,
      buttonText: t('commons.delete'),
      color: 'error' as const,
      variant: 'outlined' as const
    },
    {
      icon: <Edit />,
      buttonText: t('commons.edit'),
      color: 'primary' as const,
      variant: 'contained' as const
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
          {actionButtons.map((button, index) => (
            <Button
              size="large"
              key={index}
              startIcon={button.icon}
              color={button.color}
              variant={button.variant}
              disabled={
                button.variant === 'outlined' && deleteMutation.isPending
              }
            >
              {button.buttonText}
            </Button>
          ))}
        </Stack>
      </Box>
    </>
  );
};

export default SpontaneousFormDetail;
