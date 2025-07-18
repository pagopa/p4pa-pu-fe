import { useTranslation } from 'react-i18next';
import { generatePath, useNavigate, useParams } from 'react-router';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import DetailContainer from '../../components/DetailContainer/DetailContainer';
import { PageRoutes } from '../../routes';
import { getAssessmentsRegistry } from '../../api/assessments';
import { useStore } from '../../store/GlobalStore';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Edit from '@mui/icons-material/Edit';

export const AssessmentRegistryDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { assessmentRegistryId } = useParams<{
    assessmentRegistryId: string;
  }>();

  if (isNaN(Number(assessmentRegistryId))) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const {
    state: { organizationId }
  } = useStore();

  const { data, isError } = getAssessmentsRegistry(
    Number(organizationId),
    Number(assessmentRegistryId)
  );

  if (isError) {
    navigate(PageRoutes.RESPONSES_ERROR);
  }

  const debtTypeInfo = [
    {
      label: t('AssessmentRegistryDetail.debtPositionType'),
      value: data?.debtPositionTypeOrgCode
    }
  ];

  const assessmentRegistryInfo = [
    {
      label: t('AssessmentRegistryDetail.operatingYear'),
      value: data?.operatingYear
    },
    {
      label: t('AssessmentRegistryDetail.status'),
      value: t(`commons.status.${data?.status}`)
    },
    {
      label: t('AssessmentRegistryDetail.sectionDescription'),
      value: data?.sectionDescription
    },
    {
      label: t('AssessmentRegistryDetail.sectionCode'),
      value: data?.sectionCode
    },
    {
      label: t('AssessmentRegistryDetail.officeCode'),
      value: data?.officeCode
    },
    {
      label: t('AssessmentRegistryDetail.officeDescription'),
      value: data?.officeDescription
    },
    {
      label: t('AssessmentRegistryDetail.assessmentCode'),
      value: data?.assessmentCode
    },
    {
      label: t('AssessmentRegistryDetail.assessmentDescription'),
      value: data?.assessmentDescription
    }
  ];

  return data ? (
    <Stack gap={3}>
      <Stack>
        <TitleComponent title={data?.sectionDescription || data.sectionCode} />
        <Typography variant="body2">
          {t('AssessmentRegistryDetail.description')}
        </Typography>
      </Stack>
      <DetailContainer
        sections={[
          {
            title: {
              label: t('AssessmentRegistryDetail.debtPositionType'),
              variant: 'caption-semibold',
              fontSize: '18px'
            },
            data: debtTypeInfo,
            inline: true
          }
        ]}
      />
      <DetailContainer
        sections={[
          {
            title: {
              label: t('AssessmentRegistryDetail.sectionDescription'),
              variant: 'caption-semibold',
              fontSize: '18px'
            },
            data: assessmentRegistryInfo,
            inline: true
          }
        ]}
      />
      <Stack direction="row" justifyContent="flex-end">
        <Button
          size="large"
          startIcon={<Edit />}
          color={'primary'}
          onClick={() =>
            navigate(
              generatePath(PageRoutes.ASSESSMENT_REGISTRY_EDIT, {
                assessmentRegistryId
              })
            )
          }
          variant={'contained'}
        >
          {t('commons.edit')}
        </Button>
      </Stack>
    </Stack>
  ) : null;
};
