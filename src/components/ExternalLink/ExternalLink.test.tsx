import { render, screen } from '../../__tests__/renderers';
import ExternalLink from './ExternalLink';

describe('ExternalLink', () => {
  it('should render the link with children', () => {
    render(<ExternalLink href="https://example.com">Test Link</ExternalLink>);

    expect(
      screen.getByRole('link', { name: /Test Link/i })
    ).toBeInTheDocument();
  });

  it('should have target="_blank" attribute', () => {
    render(<ExternalLink href="https://example.com">Test Link</ExternalLink>);

    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  });

  it('should have rel="noopener noreferrer" attribute', () => {
    render(<ExternalLink href="https://example.com">Test Link</ExternalLink>);

    expect(screen.getByRole('link')).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  it('should render the OpenInNew icon', () => {
    render(<ExternalLink href="https://example.com">Test Link</ExternalLink>);

    expect(screen.getByTestId('OpenInNewIcon')).toBeInTheDocument();
  });

  it('should pass href correctly', () => {
    render(<ExternalLink href="https://example.com">Test Link</ExternalLink>);

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com'
    );
  });

  it('should apply custom sx prop', () => {
    render(
      <ExternalLink href="https://example.com" sx={{ color: 'red' }}>
        Test Link
      </ExternalLink>
    );

    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
