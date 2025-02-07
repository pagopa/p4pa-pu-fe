import { describe, it, expect, vi } from 'vitest';
import 'vitest-dom/extend-expect';
import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';
import { FooterLinksType } from '@pagopa/mui-italia';

describe('Footer', () => {
  const companyLink = {
    ariaLabel: 'Company Link',
    href: 'https://example.com',
    onClick: vi.fn(),
    image: <span data-testid="company-image">Company Logo</span>
  };

  const links: FooterLinksType[] = [
    {
      href: 'https://example.com/link1',
      label: 'Link 1',
      ariaLabel: 'Link 1',
      onClick: vi.fn(),
      linkType: 'external'
    },
    {
      href: 'https://example.com/link2',
      label: 'Link 2',
      ariaLabel: 'Link 2',
      onClick: vi.fn(),
      linkType: 'external'
    }
  ];

  const legalInfo = <div data-testid="legal-info">Legal Information</div>;

  const langProps = {
    language: 'it',
    onLanguageChanged: vi.fn(),
    languages: {
      it: {
        it: 'italiano'
      }
    }
  };

  it('should render the company link correctly', () => {
    render(<Footer companyLink={companyLink} links={links} legalInfo={legalInfo} {...langProps} />);

    // Verify that the company link is rendered
    const companyLinkElement = screen.getByRole('link', { name: 'Company Link' });
    expect(companyLinkElement).toBeInTheDocument();
    expect(companyLinkElement).toHaveAttribute('href', 'https://example.com');

    // Verify that the company image is rendered
    const companyImage = screen.getByTestId('company-image');
    expect(companyImage).toBeInTheDocument();
  });

  it('should render the links correctly', () => {
    render(<Footer companyLink={companyLink} links={links} legalInfo={legalInfo} {...langProps} />);

    // Verify that all links are rendered
    links.forEach((link) => {
      const linkElement = screen.getByRole('link', { name: link.ariaLabel });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', link.href);
      expect(linkElement).toHaveTextContent(link.label);
    });
  });

  it('should render the legal information correctly', () => {
    render(<Footer companyLink={companyLink} links={links} legalInfo={legalInfo} {...langProps} />);

    // Verify that the legal information is rendered
    const legalInfoElement = screen.getByTestId('legal-info');
    expect(legalInfoElement).toBeInTheDocument();
  });
});
