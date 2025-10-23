import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DetailContainer, {
  DetailData
} from '../DetailContainer/DetailContainer';
import TitleComponent, {
  ActionMenuItem
} from '../TitleComponent/TitleComponent';

type DetailProps = {
  pageTitle: string;
  accessibleTitle: string;
  summaryData: Array<DetailData>;
  paymentData: Array<DetailData>;
  callToAction?: ActionMenuItem;
};

const ReceiptDetail = ({
  pageTitle,
  accessibleTitle,
  summaryData,
  paymentData,
  callToAction
}: DetailProps) => {
  const { t } = useTranslation();

  return (
    <>
      <TitleComponent
        title={pageTitle}
        accessibleTitle={accessibleTitle}
        callToAction={callToAction ? [callToAction] : []}
      />
      <Grid container spacing={3}>
        <Grid item md={6}>
          <DetailContainer
            sections={[
              {
                title: {
                  label: t('commons.summary'),
                  variant: 'overline'
                },
                data: summaryData
              }
            ]}
          />
        </Grid>
        <Grid item md={6}>
          <DetailContainer
            sections={[
              {
                title: {
                  label: t('commons.payment'),
                  variant: 'overline'
                },
                data: paymentData
              }
            ]}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ReceiptDetail;
