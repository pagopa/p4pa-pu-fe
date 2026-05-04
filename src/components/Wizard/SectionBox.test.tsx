import { render, screen } from '@testing-library/react';
import SectionBox from './SectionBox';

describe('SectionBox', () => {
  it('renders title, subtitle, and children', () => {
    render(
      <SectionBox title="Main Title" subtitle="Sub Title">
        <div>Child content here</div>
      </SectionBox>
    );

    expect(screen.getByText('Main Title')).toBeInTheDocument();
    expect(screen.getByText('Sub Title')).toBeInTheDocument();
    expect(screen.getByText('Child content here')).toBeInTheDocument();
  });

  it('renders adornment if provided', () => {
    const Adornment = <span data-testid="icon">🌟</span>;

    render(
      <SectionBox title="Title with Icon" adornment={Adornment}>
        <div>Some content</div>
      </SectionBox>
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Title with Icon')).toBeInTheDocument();
  });
});
