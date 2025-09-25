import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GridSelector } from '.';

describe('GridSelector component', () => {
  const columns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'name', headerName: 'Name', flex: 1 }
  ];

  const data = [
    { id: 1, name: 'Row 1' },
    { id: 2, name: 'Row 2' },
    { id: 3, name: 'Row 3' }
  ];

  let selectedIds = [1];
  const onSelectionChange = vi.fn((ids) => {
    selectedIds = ids;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with data and columns', () => {
    render(
      <GridSelector
        data={data}
        columns={columns}
        getRowId={(row) => row.id}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        show={true}
      />
    );

    // Check headers and rows
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.getByText('Row 2')).toBeInTheDocument();
  });

  it('calls onSelectionChange when selection changes', () => {
    render(
      <GridSelector
        data={data}
        columns={columns}
        getRowId={(row) => row.id}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        show={true}
      />
    );

    // Select the second row by clicking the checkbox
    const checkboxSecondRow = screen.getAllByRole('checkbox')[2]; // first checkbox is select all
    fireEvent.click(checkboxSecondRow);

    // Expect onSelectionChange called
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('shows selected alert and clear button', () => {
    render(
      <GridSelector
        data={data}
        columns={columns}
        getRowId={(row) => row.id}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        show={true}
        showClearButton={true}
        showSelectedAlert={true}
        clearButtonLabel="Clear selection"
        selectedCountLabel={`Selected rows`}
      />
    );

    expect(screen.getByText('Selected rows')).toBeInTheDocument();

    const clearButton = screen.getByRole('button', {
      name: /Clear selection/i
    });
    fireEvent.click(clearButton);
    expect(onSelectionChange).toHaveBeenCalledWith([]);
  });

  it('returns null when show is false', () => {
    const { container } = render(
      <GridSelector
        data={data}
        columns={columns}
        getRowId={(row) => row.id}
        selectedIds={selectedIds}
        onSelectionChange={onSelectionChange}
        show={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
