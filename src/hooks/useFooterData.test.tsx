import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFooterData } from './useFooterData';
import { useFeConfig } from './useFeConfig';
import { ConfigFE } from '../../generated/apiClient';
import { render, renderHook } from '../__tests__/renderers';

vi.mock('./useFeConfig');

describe('useFooterData', () => {
  const mockConfigFe = {
    footerPrivacyInfoUrl: 'https://privacy.example.com',
    footerGDPRUrl: 'https://gdpr.example.com',
    footerTermsCondUrl: 'https://terms.example.com',
    footerAccessibilityUrl: 'https://accessibility.example.com',
    footerDescText: 'Some legal information text',
    logoFooterImg: 'https://example.com/logo.png'
  } as ConfigFE;

  beforeEach(() => {
    vi.mocked(useFeConfig).mockReturnValue(mockConfigFe);
  });

  it('should return footer links from configFe', () => {
    const { result } = renderHook(() => useFooterData());

    expect(result.current.links).toEqual([
      {
        label: 'Informativa Privacy',
        ariaLabel: 'Informativa Privacy',
        href: 'https://privacy.example.com',
        linkType: 'external'
      },
      {
        label: 'Diritto alla protezione dei dati personali',
        ariaLabel: 'Diritto alla protezione dei dati personali',
        href: 'https://gdpr.example.com',
        linkType: 'external'
      },
      {
        label: 'Termini e condizioni d’uso',
        ariaLabel: 'Termini e condizioni d’uso',
        href: 'https://terms.example.com',
        linkType: 'external'
      },
      {
        label: 'Accessibilità',
        ariaLabel: 'Accessibilità',
        href: 'https://accessibility.example.com',
        linkType: 'external'
      }
    ]);
  });

  it('should return the correct language and changeLanguage function', () => {
    const { result } = renderHook(() => useFooterData());

    expect(result.current.currentLangCode).toBe('it');
    expect(result.current.onLanguageChanged).toBeInstanceOf(Function);
  });

  it('should return the company link with the correct logo', () => {
    const { result } = renderHook(() => useFooterData());

    const image = result.current.companyLink.image;
    const imageEl = render(image);

    expect(imageEl.getByAltText('PagoPA Logo')).toBeInTheDocument();
  });

  it('should return the legalInfo markdown component with the configured text', () => {
    const { result } = renderHook(() => useFooterData());

    expect(result.current.legalInfo.props.children).toBe('Some legal information text');
  });
});
