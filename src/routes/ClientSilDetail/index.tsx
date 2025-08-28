import { Box, Button, Stack } from '@mui/material';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import DetailAccordion from '../../components/DetailAccordion/DetailAccordion';
import { DetailSectionProps } from '../../components/DetailContainer/DetailContainer';
import { useStore } from '../../store/GlobalStore';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { ClientDTO } from '../../../generated/data-contracts';
import { getClientDetail } from '../../api/clientSil';
import { PageRoutes } from '..';
import ClientSecret from './ClientSecret';

function truncTitle(str: string, maxLength = 30) {
  if (str.length > maxLength) {
    return str.slice(0, maxLength) + '...';
  }
  return str;
}

const ClientSilDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const {
    state: { organizationId }
  } = useStore();

  const [clientItem, setClientItem] = useState<ClientDTO | null>(null);

  if (!clientId) {
    navigate(PageRoutes.RESPONSES_ERROR);
    return null;
  }

  const query = getClientDetail(organizationId, clientId);

  const { isPending, isError, error, data } = query;

  useEffect(() => {
    if (isError && error) {
      console.error('Error loading client details:', error);
      navigate(PageRoutes.RESPONSES_ERROR);
    }
  }, [isError, error, navigate]);

  useEffect(() => {
    if (data && !clientItem) {
      setClientItem(data);
    }
  }, [data, clientItem]);

  const actionButtons = [
    {
      icon: <Delete />,
      buttonText: t('commons.delete'),
      color: 'error' as const,
      variant: 'outlined' as const,
      onActionClick: () => console.log('TO-DO')
    },
    {
      icon: <Edit />,
      buttonText: t('commons.edit'),
      color: 'primary' as const,
      variant: 'contained' as const,
      onActionClick: () => console.log('TO-DO')
    }
  ];

  const body: DetailSectionProps['sections'] = [
    {
      title: { label: t('commons.description'), variant: 'subtitle1' },
      data: [
        {
          label: t('clientSil.table.clientName'),
          value: data?.clientName
        },
        {
          label: t('clientSil.table.clientId'),
          value: data?.clientId
        }
      ]
    },
    {
      title: { label: t('clientSilDetail.key'), variant: 'subtitle1' },
      data: [
        {
          childrenComponent: (
            <ClientSecret secretValue={data?.clientSecret || ''} />
          )
        }
      ]
    }
  ];

  return (
    <>
      {!isPending && (
        <>
          <TitleComponent
            title={truncTitle(data?.clientId || '')}
            description={t('clientSilDetail.description')}
            callToAction={actionButtons}
          />
          <Box mt={3}>
            <Stack spacing={2}>
              <DetailAccordion
                key={1}
                title={t('clientSil.create.section.description.title')}
                description={''}
                sections={body}
                defaultExpanded={true}
              />
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
      )}
    </>
  );
};

export default ClientSilDetail;
