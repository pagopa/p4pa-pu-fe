import lang from '../../translations/lang';
import { Footer as MUIFooter } from '@pagopa/mui-italia';
import { useLanguage } from '../../hooks/useLanguage';
import { useFeConfig } from '../../hooks/useFeConfig';

const LegalInfoFallback = () => (
  <>
    <b>PagoPA S.p.A.</b> - Società per azioni con socio unico - Capitale sociale di euro 1,000,000
    interamente versato - Sede legale in Roma, Piazza Colonna 370, <br />
    CAP 00187 - N. di iscrizione a Registro Imprese di Roma, CF e P.IVA 15376371009
  </>
);

export const Footer = () => {
  const { language, changeLanguage } = useLanguage();

  const configFe = useFeConfig();

  return (
    <MUIFooter
      loggedUser={true}
      companyLink={{ ariaLabel: 'PagoPA SPA' }}
      legalInfo={<>{configFe?.footerDescText ?? <LegalInfoFallback />}</>}
      postLoginLinks={[
        {
          label: 'Informativa Privacy',
          ariaLabel: 'Informativa Privacy',
          href: configFe?.footerPrivacyInfoUrl,
          linkType: 'external'
        },
        {
          label: 'Diritto alla protezione dei dati personali',
          ariaLabel: 'Diritto alla protezione dei dati personali',
          href: configFe?.footerGDPRUrl,
          linkType: 'external'
        },
        {
          label: 'Termini e condizioni d’uso',
          ariaLabel: 'Termini e condizioni d’uso',
          href: configFe?.footerTermsCondUrl,
          linkType: 'external'
        },
        {
          label: 'Accessibilità',
          ariaLabel: 'Accessibilità',
          href: configFe?.footerAccessibilityUrl,
          linkType: 'external'
        }
      ]}
      preLoginLinks={{
        aboutUs: {
          links: []
        },
        resources: {
          links: []
        },
        followUs: {
          title: '',
          socialLinks: [],
          links: []
        }
      }}
      currentLangCode={language}
      languages={lang}
      onLanguageChanged={changeLanguage}
    />
  );
};
