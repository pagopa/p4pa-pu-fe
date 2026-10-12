import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Field, Row, Section } from './Containers';

describe('Field', () => {
  it('renders the label and value, with a tooltip for string values', async () => {
    render(<Field label="Name">Mario Rossi</Field>);

    expect(screen.getByText('Name')).toBeInTheDocument();

    fireEvent.mouseOver(screen.getByText('Mario Rossi'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Mario Rossi');
  });

  it('does not show a tooltip for non-string values', async () => {
    render(
      <Field label="Status">
        <span>Active</span>
      </Field>
    );

    fireEvent.mouseOver(screen.getByText('Active'));
    // The tooltip opens after a short enter delay; wait it out before asserting absence.
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});

describe('Row', () => {
  it('renders its children and calls onShow when the show button is clicked', () => {
    const onShow = vi.fn();

    render(
      <Row name="Item" onShow={onShow}>
        <Field label="Name">Mario</Field>
      </Row>
    );

    expect(screen.getByText('Mario')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));

    expect(onShow).toHaveBeenCalledTimes(1);
  });
});

describe('Section', () => {
  it('renders the title as a heading that labels its section', () => {
    render(
      <Section title="Integrations">
        <p>content</p>
      </Section>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Integrations' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Integrations' })
    ).toHaveTextContent('content');
  });
});
