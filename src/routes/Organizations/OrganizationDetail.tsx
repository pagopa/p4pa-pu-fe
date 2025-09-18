import { Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useNavigate, useParams } from 'react-router';
import { useStore } from '../../store/GlobalStore';
import { getOrganizationDetail } from '../../api/organizations';
import { useEffect, useState } from 'react';
import { OrganizationDetailDTO } from '../../../generated/data-contracts';
import { PageRoutes } from '..';
import DetailContainer from '../../components/DetailContainer/DetailContainer';
import {
  accountingInfo,
  info,
  integrationBox,
  paymentInfo
} from './components/OrganizationDetailSections';
import { theme } from '@pagopa/mui-italia';

export const OrganizationDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { organizationId: organizationIdByURL } = useParams<{
    organizationId: string;
  }>();
  const {
    state: { organizationId }
  } = useStore();

  const [organizationDetailData, setOrganizationDetailData] =
    useState<OrganizationDetailDTO>();

  const getOrganizationId = !isNaN(Number(organizationIdByURL))
    ? Number(organizationIdByURL)
    : organizationId;

  const { isError, isSuccess, data } = getOrganizationDetail(getOrganizationId);

  useEffect(() => {
    if (isError) {
      navigate(PageRoutes.ORGANIZATIONS_INDEX);
    } else {
      setOrganizationDetailData(data);
    }
  }, [data]);

  return (
    <>
      <TitleComponent
        title={(isSuccess && organizationDetailData?.orgName) || ''}
      />
      <Grid
        container
        direction={'column'}
        rowSpacing={2}
        justifyContent={'flex-start'}
        mt={2}
      >
        <Grid item xs={12}>
          <Grid container direction={'row'} spacing={2}>
            <Grid item md={7}>
              {organizationDetailData && (
                <DetailContainer
                  omitFlexGridDirection={true}
                  sections={[
                    {
                      inline: true,
                      inlineSizeFirstElement: 5,
                      title: {
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        fontSize: '14px',
                        label: t('commons.infoSingular')
                      },
                      data: info(organizationDetailData, t)
                    }
                  ]}
                />
              )}
            </Grid>
            <Grid item md={5}>
              <Box
                borderRadius={2}
                bgcolor={theme.palette.background.paper}
                padding={2}
                display={'flex'}
                justifyContent={'center'}
              >
                <Box
                  sx={{
                    border: `1px solid ${theme.palette.grey[300]}`,
                    borderRadius: 2,
                    display: 'inline-block',
                    fontSize: 0,
                    padding: 2,
                    width: '150px'
                  }}
                >
                  <img src={organizationDetailData?.orgLogo} width={'100%'} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {organizationDetailData && (
            <DetailContainer
              omitFlexGridDirection={true}
              sections={[
                {
                  inline: true,
                  inlineSizeFirstElement: 3,
                  title: {
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    fontSize: '14px',
                    label: t('commons.accountingInformation')
                  },
                  data: accountingInfo(organizationDetailData, t)
                }
              ]}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {organizationDetailData && (
            <DetailContainer
              omitFlexGridDirection={true}
              sections={[
                {
                  inline: true,
                  inlineSizeFirstElement: 3,
                  title: {
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    fontSize: '14px',
                    label: t('commons.payments')
                  },
                  data: paymentInfo(organizationDetailData, t)
                }
              ]}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {organizationDetailData && (
            <DetailContainer
              omitFlexGridDirection={true}
              sections={[
                {
                  inline: true,
                  inlineSizeFirstElement: 3,
                  title: {
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    fontSize: '14px',
                    label: t('organizations.otherProducts')
                  },
                  data: integrationBox(organizationDetailData, t)
                }
              ]}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default OrganizationDetail;
