import { useTranslation } from 'react-i18next';
import { useFeConfig } from './useFeConfig';
import { useLanguage } from './useLanguage';
import { Markdown } from '../components/Markdown';
import lang from '../translations/lang';
import { FooterLinksType, LogoPagoPACompany } from '@pagopa/mui-italia';
import { CompanyLinkType } from '../components/Footer';

export const useFooterData = () => {
  const { language, changeLanguage } = useLanguage();

  const configFe = useFeConfig();
  const { t } = useTranslation();

  const links: FooterLinksType[] = [
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
  ];

  // TODO: logo aria-label and alt should be in config
  const companyLink: CompanyLinkType = {
    ariaLabel: 'PagoPA SPA',
    image: configFe?.logoFooterImg ? (
      <img src={configFe?.logoFooterImg} alt="PagoPA Logo" />
    ) : (
      <LogoPagoPACompany />
    )
  };

  return {
    languages: lang,
    onLanguageChanged: changeLanguage,
    currentLangCode: language,
    links,
    companyLink,
    legalInfo: <Markdown>{configFe?.footerDescText ?? t('commons.footer.infoFallback')}</Markdown>
  };
};
