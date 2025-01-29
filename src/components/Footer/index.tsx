import lang from '../../translations/lang';
import { Footer as MUIFooter } from '@pagopa/mui-italia';
import { useLanguage } from '../../hooks/useLanguage';
import { useFeConfig } from '../../hooks/useFeConfig';
import { Markdown } from '../Markdown';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { language, changeLanguage } = useLanguage();

  const configFe = useFeConfig();
  const { t } = useTranslation();

  return (
    <MUIFooter
      loggedUser={true}
      companyLink={{ ariaLabel: 'PagoPA SPA' }}
      legalInfo={<Markdown>{configFe?.footerDescText ?? t('commons.footer.infoFallback')}</Markdown>}
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
