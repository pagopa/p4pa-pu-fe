import { describe, it, vi, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '../../__tests__/renderers';
import ExportFlowContainer from './ExportFlowContainer';

describe('ExportFlowContainer', () => {
  let mockOnSelectChange: (field: string, value: string) => void;
  let formData: Record<string, string>;

  beforeEach(() => {
    mockOnSelectChange = vi.fn();
    formData = {
      fileVersion: ''
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

  it('renders dateRange', () => {
    const DateRangeMock = () => <div data-testid="date-range-component" />;

    render(
      <ExportFlowContainer
        section={[
          {
            direction: 'row',
            title: {
              icon: <span data-testid="icon" />,
              label: 'commons.paymentDate'
            },
            inputFields: [{ fieldKey: 'dateRange', label: '' }],
            dateRange: <DateRangeMock />
          }
        ]}
        formData={{}}
        onSelectChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('date-range-component')).toBeDefined();
  });
});
