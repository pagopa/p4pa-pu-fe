import { render } from '../../__tests__/renderers';
import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DetailAccordion from './DetailAccordion';

describe('DetailAccordion', () => {
  const mockProps = {
    idTitle: 1,
    title: 'test title',
    description: 'test description',
    sections: [
      {
        title: { label: 'section 1' },
        data: [
          { label: 'field 1', value: 'value 1' },
          { label: 'field 2', value: 'value 2' }
        ]
      },
      {
        title: { label: 'section 2' },
        data: [{ label: 'field 3', value: 'value 3' }]
      }
    ]
  };

  it('renders title, id and description', () => {
    render(<DetailAccordion {...mockProps} />);

    expect(screen.getByText('test title')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('test description')).toBeInTheDocument();
  });

  it('renders section titles and values', () => {
    render(<DetailAccordion {...mockProps} />);

    expect(screen.getByText('section 1')).toBeInTheDocument();
    expect(screen.getByText('field 1')).toBeInTheDocument();
    expect(screen.getByText('value 1')).toBeInTheDocument();
    expect(screen.getByText('field 2')).toBeInTheDocument();
    expect(screen.getByText('value 2')).toBeInTheDocument();

    expect(screen.getByText('section 2')).toBeInTheDocument();
    expect(screen.getByText('field 3')).toBeInTheDocument();
    expect(screen.getByText('value 3')).toBeInTheDocument();
  });

  it('renders correctly without idTitle', () => {
    const { idTitle, ...rest } = mockProps;
    render(<DetailAccordion {...rest} />);

    expect(screen.queryByText(idTitle)).not.toBeInTheDocument();
  });
});
