import { i18nTestSetup } from '../../../__tests__/i18nTestSetup';
import {
  render,
  screen,
  waitFor,
  fireEvent
} from '../../../__tests__/renderers';
import DynamicFieldsDataGrid from './DynamicFieldsDataGrid';

const translations = {
  ioMessageGuide: {
    table: {
      name: 'Nome',
      example: 'Esempio',
      tag: 'Tag'
    },
    copy: 'Copia',
    copied: 'Copiato!',
    copyAriaLabel: 'Copia tag {{tag}}'
  }
};

const mockData = [
  {
    id: 1,
    name: 'Nome debitore',
    example: 'Mario Rossi',
    tag: '%debitore_nomeCompleto%'
  },
  {
    id: 2,
    name: 'IUV',
    example: '01000000000000952',
    tag: '%IUV%',
    tooltip: 'Identificativo Univoco di Versamento'
  }
];

describe('DynamicFieldsDataGrid', () => {
  beforeEach(() => {
    i18nTestSetup(translations);
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  it('should render the data grid with correct headers', () => {
    render(<DynamicFieldsDataGrid data={mockData} />);

    expect(
      screen.getByRole('columnheader', {
        name: translations.ioMessageGuide.table.name
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {
        name: translations.ioMessageGuide.table.example
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {
        name: translations.ioMessageGuide.table.tag
      })
    ).toBeInTheDocument();
  });

  it('should render all data rows', () => {
    render(<DynamicFieldsDataGrid data={mockData} />);

    expect(screen.getByText('Nome debitore')).toBeInTheDocument();
    expect(screen.getByText('Mario Rossi')).toBeInTheDocument();
    expect(screen.getByText('IUV')).toBeInTheDocument();
  });

  it('should render tooltip icon for rows with tooltip', () => {
    render(<DynamicFieldsDataGrid data={mockData} />);

    const infoIcons = screen.getAllByTestId('InfoOutlinedIcon');
    expect(infoIcons.length).toBe(1);
  });

  it('should copy tag to clipboard when copy button is clicked', async () => {
    render(<DynamicFieldsDataGrid data={mockData} />);

    const copyButtons = screen.getAllByRole('button');
    fireEvent.click(copyButtons[0]);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '%debitore_nomeCompleto%'
      );
    });
  });

  it('should render with empty data', () => {
    render(<DynamicFieldsDataGrid data={[]} />);

    expect(
      screen.getByRole('columnheader', {
        name: translations.ioMessageGuide.table.name
      })
    ).toBeInTheDocument();
  });
});
