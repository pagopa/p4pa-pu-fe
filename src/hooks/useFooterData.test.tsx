import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFooterData } from './useFooterData';
import { ConfigFE } from '../../generated/core/client';
import { render, renderHook, act } from '../__tests__/renderers';
import { setConfigFe } from '../store/ConfigFeStore';
import { PageRoutes } from '../routes';

const mockImage = {
  onload: vi.fn(),
  onerror: vi.fn(),
  src: ''
};

const originalImage = global.Image;

describe('useFooterData', () => {
  const mockConfigFe = {
    footerAccessibilityUrl: 'https://accessibility.example.com',
    footerDescText: 'Some legal information text',
    logoFooterImg:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
  } as ConfigFE;
  setConfigFe(mockConfigFe);

  beforeEach(() => {
    global.Image = vi.fn(() => mockImage) as unknown as typeof global.Image;
  });

  afterEach(() => {
    global.Image = originalImage;
  });

  it('should return footer links from configFe', () => {
    const { result } = renderHook(() => useFooterData());

    expect(result.current.links).toEqual([
      {
        label: 'Informativa Privacy',
        ariaLabel: 'Informativa Privacy',
        href: PageRoutes.PRIVACYPOLICY,
        linkType: 'internal'
      },
      {
        label: 'Diritto alla protezione dei dati personali',
        ariaLabel: 'Diritto alla protezione dei dati personali',
        href: PageRoutes.PRIVACYPOLICY,
        linkType: 'internal'
      },
      {
        label: 'Termini e condizioni d’uso',
        ariaLabel: 'Termini e condizioni d’uso',
        href: PageRoutes.TOS,
        linkType: 'internal'
      },
      {
        label: 'Accessibilità',
        ariaLabel: 'Accessibilità',
        href: 'https://accessibility.example.com',
        linkType: 'external'
      }
    ]);
  });

  it('should return the company link with the correct logo after validation', async () => {
    const { result } = renderHook(() => useFooterData());

    expect(result.current.companyLink.image).toBeNull();

    await act(async () => {
      const imgInstance = mockImage;
      expect(imgInstance.src).toBe(mockConfigFe.logoFooterImg);
      imgInstance.onload();
    });

    const imageEl = render(result.current.companyLink.image);
    expect(imageEl.getByAltText('PagoPA Logo')).toBeInTheDocument();
  });

  it('should handle invalid image logo', async () => {
    const { result } = renderHook(() => useFooterData());

    await act(async () => {
      const imgInstance = mockImage;
      imgInstance.onerror();
    });

    expect(result.current.companyLink.image).toBeNull();
  });

  it('should return the legalInfo markdown component with the configured text', () => {
    const { result } = renderHook(() => useFooterData());

    expect(result.current.legalInfo.props.children).toBe(
      'Some legal information text'
    );
  });
});
