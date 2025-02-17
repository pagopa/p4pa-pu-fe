import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ExportFlowContainer from './ExportFlowContainer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('ExportFlowContainer', () => {
  let mockOnSelectChange: (field: string, value: string) => void;
  let formData: { [key: string]: string };

  beforeEach(() => {
    mockOnSelectChange = vi.fn();
    formData = {
      from: '',
      to: '',
      fileVersion: '',
    };
  });

  it('renders with title, description and required field', () => {
    render(
      <ExportFlowContainer
        section={[
          {
            direction: 'column',
            title: {
              icon: <span data-testid="icon" />,
              label: 'exportFlow.fileVersion'
            },
            inputFields: [
              {
                label: 'exportFlow.fileVersion',
                fieldKey: 'fileVersion',
                required: true
              }
            ],
            selectOptions: [
              { label: 'version1', value: 'version1' },
              { label: 'version2', value: 'version2' },
              { label: 'version3', value: 'version3' }
            ]
          }
        ]}
        formData={formData}
        onSelectChange={mockOnSelectChange}
      />
    );

    expect(screen.getByText('exportFlow.formTitle')).toBeDefined();
    expect(screen.getByText('exportFlow.formDescription')).toBeDefined();
    expect(screen.getByText('commons.requiredFieldDescription')).toBeDefined();
    expect(screen.getAllByText('exportFlow.fileVersion')[0]).toBeDefined();
  });

  it('calls onSelectChange when a select option is chosen', async () => {
    render(
      <ExportFlowContainer
        section={[
          {
            direction: 'column',
            title: {
              icon: <span data-testid="icon" />,
              label: 'exportFlow.fileVersion'
            },
            inputFields: [
              {
                label: 'exportFlow.fileVersion',
                fieldKey: 'fileVersion',
                required: true
              }
            ],
            selectOptions: [
              { label: 'version1', value: 'version1' },
              { label: 'version2', value: 'version2' },
              { label: 'version3', value: 'version3' }
            ]
          }
        ]}
        formData={formData}
        onSelectChange={mockOnSelectChange}
      />
    );

    const select = screen.getAllByRole('combobox')[0];

    fireEvent.mouseDown(select);
    await screen.findByRole('listbox');

    const listbox = screen.getByRole('listbox');
    const firstOption = within(listbox).getByText('version1');
    fireEvent.click(firstOption);

    expect(mockOnSelectChange).toHaveBeenCalledWith('fileVersion', 'version1');
  });

  it('calls onSelectChange when an input field is modified', () => {
    render(
      <ExportFlowContainer
        section={[
          {
            direction: 'row',
            title: {
              icon: <span data-testid="icon" />,
              label: 'commons.paymentDate'
            },
            inputFields: [
              {
                label: 'commons.from',
                fieldKey: 'from',
                required: true
              },
              {
                label: 'commons.to',
                fieldKey: 'to',
                required: true
              }
            ]
          }
        ]}
        formData={formData}
        onSelectChange={mockOnSelectChange}
      />
    );

    const inputsDate = screen.getAllByRole('textbox');

    fireEvent.change(inputsDate[0], { target: { value: '10/10/2025' } });
    fireEvent.change(inputsDate[1], { target: { value: '20/10/2025' } });

    expect(mockOnSelectChange).toHaveBeenCalledWith('from', '10/10/2025');
    expect(mockOnSelectChange).toHaveBeenCalledWith('to', '20/10/2025');
  });
});
