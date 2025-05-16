import { Box, Button, Stack } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TitleComponent from '../../components/TitleComponent/TitleComponent';
import { useParams } from 'react-router-dom';
import { DetailAccordion } from '../../components/DetailAccordion/DetailAccordion';
import {
  AccordionSectionConfig,
  getAccordionSectionsConfig
} from '../../models/DebtTypeSectionsConfig';
import { useEffect, useState } from 'react';

export const DebtTypeDetailView = () => {
  const { debtPositionTypeOrgId } = useParams<{
    debtPositionTypeOrgId: string;
  }>();
  const { t } = useTranslation();
  const [accordionSections, setAccordionSections] = useState<
    Array<AccordionSectionConfig>
  >([]);

  if (isNaN(Number(debtPositionTypeOrgId))) {
    // TODO
    // raise error
    console.error('debtPositionTypeOrgId is not a number');
  }

  // TODO add API
  const data = {
    creationDate: '2025-01-20T14:58:02.800181',
    updateDate: '2025-01-20T14:58:02.800181',
    updateOperatorExternalId: 'EUqKiD1psLrGNuLxCGzriy-royPlBvuyeJMc0dxaxNs=',
    updateTraceId: '-',
    debtPositionTypeOrgId: 1,
    debtPositionTypeId: 1,
    organizationId: 1,
    balance:
      '<bilancio xmlns="http://www.regione.veneto.it/schemas/2012/Pagamenti/Ente/">\n\t<capitolo>\n\t\t<codCapitolo>102083</codCapitolo>\n\t\t<accertamento>\n\t\t\t<importo>6.00</importo>\n\t\t</accertamento>\n\t</capitolo>\n</bilancio>',
    code: 'CODE011',
    description: 'TARI',
    iban: 'IT60X0542811101000000123456',
    postalIban: 'IT60X0542811101000000123457',
    postalAccountCode: '1234567890',
    holderPostalCc: 'Holder Postal CC',
    orgSector: 'Public Sector',
    xsdDefinitionRef: 'definitionRef123',
    externalPaymentUrl: 'https://example.com/payment',
    flagAnonymousFiscalCode: false,
    flagMandatoryDueDate: false,
    flagSpontaneous: false,
    flagNotifyIo: true,
    serviceId: '01J1F178BDBCGWE8HEN13WMK6N',
    ioTemplateSubject:
      '[TEST] Notifica inviata con successo! Sì, funziona davvero',
    ioTemplateMessage:
      'Descrizione posizione debitoria: %posizioneDebitoria_descrizione%. Nome completo debitore: %debitore_nomeCompleto%. Codice Fiscale debitore: %debitore_codiceFiscale%. Importo totale: %importoTotale% euro. Codice IUV: %IUV%. NAV: %NAV%. Causale: %causale%. Data di esecuzione pagamento: %dataScadenza%.',
    flagActive: true,
    flagNotifyOutcomePush: false,
    flagAmountActualization: false,
    flagExternal: false
  };

  useEffect(() => {
    const sections = getAccordionSectionsConfig(data, t) || [];
    setAccordionSections(sections);
  }, []);

  const actionButtons = [
    {
      icon: <Delete />,
      buttonText: t('commons.delete'),
      color: 'error' as const,
      variant: 'outlined' as const,
      onActionClick: () => console.log('onActionClick delete')
    },
    {
      icon: <Edit />,
      buttonText: t('commons.edit'),
      color: 'primary' as const,
      variant: 'contained' as const,
      onActionClick: () => console.log('onActionClick edit')
    }
  ];

  return (
    <>
      <>
        <TitleComponent
          title={data?.description ?? '-'}
          description={t('debtTypeDetail.description')}
          callToAction={actionButtons}
        />
        <Box mt={3}>
          <Stack spacing={2}>
            {accordionSections?.map((section, index) => (
              <DetailAccordion
                key={section.configType}
                idTitle={++index}
                title={section.title}
                description={section.description}
                sections={section.sections}
              />
            ))}
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
    </>
  );
};

export default DebtTypeDetailView;
