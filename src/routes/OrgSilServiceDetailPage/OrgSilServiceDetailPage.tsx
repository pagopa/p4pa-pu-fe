import { Box, Button, Stack } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { STATE } from '../../store/types';
import { useStore } from '../../store/GlobalStore';
import DetailContainer from '../../components/DetailContainer/DetailContainer';
import orgSilServiceApi from '../../api/orgSilService';
import { DetailSectionProps } from '../../components/DetailContainer/DetailContainer';
import { getOrgSilServiceSectionsConfig } from './model/OrgSilServiceSectionConfigs';

export const OrgSilServiceDetailPage = () => {
  const [sections, setSections] = useState<DetailSectionProps['sections']>([]);
  const { state } = useStore();
  const { t } = useTranslation();
  const organizationId = Number(state[STATE.ORGANIZATION_ID]);

  const { orgSilServiceId } = useParams<{
    orgSilServiceId: string;
  }>();

  const { data, isSuccess, isLoading } = orgSilServiceApi.getOrgSilServiceById({
    organizationId,
    orgSilServiceId: Number(orgSilServiceId)
  });

  useEffect(() => {
    if (isSuccess && data?.response) {
      const sectionsConfig = getOrgSilServiceSectionsConfig(data.response, t);
      setSections(sectionsConfig);
    }
  }, [data, isSuccess, t]);

  const actionButtons = [
    {
      icon: <Delete />,
      buttonText: t('commons.delete'),
      color: 'error' as const,
      variant: 'outlined' as const,
      onActionClick: () => console.log('delete click')
    },
    {
      icon: <Edit />,
      buttonText: t('commons.edit'),
      color: 'primary' as const,
      variant: 'contained' as const,
      disabled: false,
      onActionClick: () => console.log('edit click')
    }
  ];

  return (
    <>
      <TitleComponent
        title={data?.response?.applicationName || '-'}
        description={t('orgSilServiceDetail.description')}
      />

      <Box mt={3}>
        <Stack spacing={2}>
          <DetailContainer sections={sections} fullWidthSections={true} />
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
              disabled={button.disabled || isLoading}
              onClick={button.onActionClick}
            >
              {button.buttonText}
            </Button>
          ))}
        </Stack>
      </Box>
    </>
  );
};

export default OrgSilServiceDetailPage;
