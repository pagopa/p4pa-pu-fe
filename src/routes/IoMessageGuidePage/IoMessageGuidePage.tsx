import { useTranslation } from 'react-i18next';
import {
  Container,
  Grid,
  Typography,
  Paper,
  Alert,
  useTheme
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DynamicFieldsDataGrid from './components/DynamicFieldsDataGrid';
import ExternalLink from '../../components/ExternalLink/ExternalLink';

type DynamicFieldRow = {
  id: number;
  name: string;
  example: string;
  tag: string;
  tooltip?: string;
};

export const IoMessageGuidePage = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const dynamicFieldsData: Array<DynamicFieldRow> = [
    {
      id: 1,
      name: t('ioMessageGuide.dynamicFields.debtorName.name'),
      example: 'Mario Rossi',
      tag: '%debitore_nomeCompleto%'
    },
    {
      id: 2,
      name: t('ioMessageGuide.dynamicFields.fiscalCode.name'),
      example: 'RSSMRA80L10F593A',
      tag: '%debitore_codiceFiscale%'
    },
    {
      id: 3,
      name: t('ioMessageGuide.dynamicFields.totalAmount.name'),
      example: '00.00€',
      tag: '%importoTotale%'
    },
    {
      id: 4,
      name: t('ioMessageGuide.dynamicFields.iuv.name'),
      example: '01000000000000952',
      tag: '%IUV%',
      tooltip: t('ioMessageGuide.dynamicFields.iuv.tooltip')
    },
    {
      id: 5,
      name: t('ioMessageGuide.dynamicFields.noticeCode.name'),
      example: '301000000000025115',
      tag: '%NAV%',
      tooltip: t('ioMessageGuide.dynamicFields.noticeCode.tooltip')
    },
    {
      id: 6,
      name: t('ioMessageGuide.dynamicFields.paymentReason.name'),
      example: 'Pagamento TARI 2025',
      tag: '%causale%',
      tooltip: t('ioMessageGuide.dynamicFields.paymentReason.tooltip')
    },
    {
      id: 7,
      name: t('ioMessageGuide.dynamicFields.dueDate.name'),
      example: '10/12/2025',
      tag: '%dataScadenza%'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
        {t('ioMessageGuide.title')}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t('ioMessageGuide.description')}
      </Typography>

      {/* Section: How to write a message */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
          {t('ioMessageGuide.sections.howToWrite.title')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, whiteSpace: 'pre-line' }}
        >
          {t('ioMessageGuide.sections.howToWrite.description')}
        </Typography>
        <ExternalLink href="#">
          {t('ioMessageGuide.sections.howToWrite.link')}
        </ExternalLink>
      </Paper>

      {/* Section: How to format a message */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
          {t('ioMessageGuide.sections.howToFormat.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('ioMessageGuide.sections.howToFormat.description')}
        </Typography>
        <ExternalLink href="#">
          {t('ioMessageGuide.sections.howToFormat.link')}
        </ExternalLink>
      </Paper>

      {/* Section: Dynamic fields */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
          {t('ioMessageGuide.sections.dynamicFields.title')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, whiteSpace: 'pre-line' }}
        >
          {t('ioMessageGuide.sections.dynamicFields.description')}
        </Typography>

        <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mb: 3 }}>
          {t('ioMessageGuide.sections.dynamicFields.alert')}
        </Alert>

        <Grid
          container
          p={2}
          height="100%"
          sx={{
            bgcolor: theme.palette.grey[200],
            overflow: 'auto'
          }}
        >
          <DynamicFieldsDataGrid data={dynamicFieldsData} />
        </Grid>
      </Paper>
    </Container>
  );
};

export default IoMessageGuidePage;
