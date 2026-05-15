import { useTranslation } from 'react-i18next';
import { useLanguage } from './useLanguage';
import { Markdown } from '../components/Markdown';
import { FooterLinksType } from '@pagopa/mui-italia';
import { CompanyLinkType } from '../components/Footer';
import { useEffect, useState } from 'react';
import { useStore } from '../store/GlobalStore';
import { languages } from '@core/translations/languages';

const isValidImage = (imgSrc: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imgSrc;
  });
};

export const useFooterData = () => {
  const { language, changeLanguage } = useLanguage();

  const {
    state: { configFe }
  } = useStore();
  const { t } = useTranslation();

  const [validLogoImg, setValidLogoImg] = useState<string | null>(null);

  useEffect(() => {
    const validateLogo = async () => {
      if (configFe?.logoFooterImg) {
        const isValid = await isValidImage(configFe.logoFooterImg);
        setValidLogoImg(isValid ? configFe.logoFooterImg : null);
      } else {
        setValidLogoImg(null);
      }
    };

    validateLogo();
  }, [configFe?.logoFooterImg]);

  const links: Array<FooterLinksType> = [
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
    image: validLogoImg ? <img src={validLogoImg} alt="PagoPA Logo" /> : null
  };

  return {
    languages,
    onLanguageChanged: changeLanguage,
    currentLangCode: language,
    links,
    companyLink,
    legalInfo: (
      <Markdown>
        {configFe?.footerDescText ?? t('commons.footer.infoFallback')}
      </Markdown>
    )
  };
};
