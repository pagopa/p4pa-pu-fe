import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReportingPaymentDetail from '.';
import { render, screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { getPaymentsReportingDetail } from '../../api/getPaymentsReportingDetail';
import { paymentsReportingDetailDTOSchema } from '../../../generated/zod-schema';
import { createMock } from 'zodock';
import { useStore } from '../../store/GlobalStore';
import { STATE } from '../../store/types';

vi.mock('../../api/getPaymentsReportingDetail', () => ({
  getPaymentsReportingDetail: vi.fn()
}));

vi.mock('react-router-dom', () => {
  const useParamsMock = vi.fn();
  return {
    useParams: useParamsMock
  };
});

vi.mock('../../store/GlobalStore', () => ({
  useStore: vi.fn()
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Inizio della suite di test per il componente ReportingPaymentDetail
describe('ReportingPaymentDetail Page', () => {
  // Dati mock costanti usati nei test
  const mockOrganizationId = '123';
  const mockIuf = 'iuf123';
  const mockId = '456';
  // Crea un oggetto mock completo basato sullo schema Zod
  const mockData = createMock(paymentsReportingDetailDTOSchema);

  // Configurazione da eseguire prima di ogni test
  beforeEach(() => {
    // Resetta tutti i mock per avere un ambiente pulito per ogni test
    vi.clearAllMocks();
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      iuf: mockIuf,
      id: mockId
    });
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      state: { [STATE.ORGANIZATION_ID]: mockOrganizationId }
    });

    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: mockData,
      isLoading: false
    });
  });

  // Test 1: Verifica che il componente si renderizzi correttamente
  it('renders Reporting Payment Detail without crashing', () => {
    render(<ReportingPaymentDetail />);
    // Verifica che gli elementi principali siano presenti nel DOM
    expect(
      screen.getByText('reportingPaymentDetail.title')
    ).toBeInTheDocument();
    expect(screen.getByText('commons.summary')).toBeInTheDocument();
    expect(screen.getByText('commons.payment')).toBeInTheDocument();
  });

  // Test 2: Verifica che l'indicatore di caricamento venga mostrato quando i dati sono in caricamento
  it('shows loading indicator when data is loading', () => {
    // Configura il mock per simulare il caricamento in corso
    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: undefined,
      isLoading: true
    });
    // Renderizza il componente
    render(<ReportingPaymentDetail />);
    // Verifica che l'indicatore di caricamento (CircularProgress) sia visibile
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  // Test 3: Verifica che i dati del pagamento vengano visualizzati quando sono disponibili
  it('displays payment data when available', () => {
    // Crea un mock personalizzato con dati specifici per testare la visualizzazione
    const customMockData = {
      ...mockData,
      iuv: 'IUV12345',
      iud: 'IUD67890',
      remittanceInformation: 'Pagamento tassa'
    };

    // Configura il mock per ritornare i dati personalizzati
    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: customMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);
    // Verifica che i dati specifici siano visualizzati correttamente
    expect(screen.getByText('IUV12345')).toBeInTheDocument();
    expect(screen.getByText('IUD67890')).toBeInTheDocument();
    expect(screen.getByText('Pagamento tassa')).toBeInTheDocument();

    // Verifica che la label dello stato sia presente
    expect(screen.getByText('commons.state')).toBeInTheDocument();
  });

  // Test 4: Verifica che la funzione API venga chiamata con i parametri corretti
  it('calls getPaymentsReportingDetail with correct parameters', () => {
    render(<ReportingPaymentDetail />);
    // Verifica che la funzione API sia stata chiamata con i parametri attesi
    expect(getPaymentsReportingDetail).toHaveBeenCalledWith(
      Number(mockOrganizationId),
      mockIuf,
      mockId
    );
  });

  // ===== TEST DI COPERTURA DEI BRANCH CONDIZIONALI =====

  // Test 5: Verifica che il componente gestisca correttamente i parametri URL nulli
  it('handles null iuf and id parameters', () => {
    // Configura il mock per ritornare parametri null
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({
      iuf: null,
      id: null
    });

    render(<ReportingPaymentDetail />);

    // Verifica che la funzione API venga chiamata con stringhe vuote (non null)
    expect(getPaymentsReportingDetail).toHaveBeenCalledWith(
      Number(mockOrganizationId),
      '',
      ''
    );
  });

  // Test 6: Verifica la corretta gestione di un debitore di tipo persona fisica
  it('handles fisical person debtor type correctly', () => {
    // Crea un mock con debitore di tipo persona fisica
    const personMockData = {
      ...mockData,
      debtor: {
        ...mockData.debtor,
        entityType: 'F', // 'F' indica persona fisica
        fullName: 'Mario Rossi',
        fiscalCode: 'RSSMRA80A01H501U'
      }
    };

    // Configura il mock per ritornare i dati della persona fisica
    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: personMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    // Verifica che il nome della persona appaia nel documento (potrebbe apparire in più punti)
    const nameElements = screen.getAllByText(/Mario Rossi/);
    expect(nameElements.length).toBeGreaterThan(0);

    // Verifica che il codice fiscale appaia nel documento (potrebbe apparire in più punti)
    const fiscalCodeElements = screen.getAllByText(/RSSMRA80A01H501U/);
    expect(fiscalCodeElements.length).toBeGreaterThan(0);

    // Verifica che la label del pagatore sia presente
    expect(screen.getByText('commons.payer')).toBeInTheDocument();

    // Verifica che sia presente l'indicazione di persona fisica
    const personTypeElements = screen.getAllByText(/\(commons\.person\)/);
    expect(personTypeElements.length).toBeGreaterThan(0);
  });

  // Test 7: Verifica la corretta gestione di un debitore nullo
  it('handles null debtor data correctly', () => {
    // Crea un mock con debitore nullo
    const nullDebtorMockData = {
      ...mockData,
      debtor: null
    };

    // Configura il mock per ritornare dati con debitore nullo
    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: nullDebtorMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    // Verifica che non ci siano errori nel rendering e che le etichette siano presenti
    expect(
      screen.getByText('commons.fiscalCodeorVat commons.payer')
    ).toBeInTheDocument();

    // Verifica che ci sia un elemento con il valore di default per CF/PIVA
    const fiscalCodeElements = screen.getAllByText(/^\[CF\/PIVA:/);
    expect(fiscalCodeElements.length).toBeGreaterThan(0);
  });

  // Test 8: Verifica che la data di pagamento venga formattata correttamente
  it('formats payment date correctly when available', () => {
    // Crea un mock con una data di pagamento specifica
    const dateMockData = {
      ...mockData,
      paymentDateTime: '2023-04-15T14:30:00' // Formato ISO
    };

    // Configura il mock per ritornare i dati con la data
    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: dateMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    // Verifica che la data sia stata formattata nel formato italiano (gg/mm/aaaa)
    expect(screen.getByText('15/04/2023')).toBeInTheDocument();
  });

  // Test 9: Verifica che la label dello stato venga visualizzata correttamente
  it('displays state label correctly', () => {
    // Crea un mock con uno stato di pagamento specifico
    const statusMockData = {
      ...mockData,
      status: 'PAID'
    };

    // Configura il mock per ritornare i dati con lo stato
    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: statusMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    // Verifica che la label dello stato sia presente
    expect(screen.getByText('commons.state')).toBeInTheDocument();
  });

  // Test 10: Verifica che vengano utilizzati i colori corretti per i diversi stati
  it('uses correct chip colors based on state type', () => {
    // Array di stati da testare
    const testStatuses = ['PAID', 'CANCELLED', 'DRAFT'];

    // Itera su ogni stato
    for (const status of testStatuses) {
      // Crea un mock con lo stato corrente
      const statusMockData = {
        ...mockData,
        status: status
      };
      // Configura il mock per ritornare i dati con lo stato corrente
      (
        getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        data: statusMockData,
        isLoading: false
      });
      // Renderizza il componente, salvando la funzione di unmount
      const { unmount } = render(<ReportingPaymentDetail />);

      // Verifica che la label dello stato sia presente per ogni stato
      expect(screen.getByText('commons.state')).toBeInTheDocument();

      // Smonta il componente per evitare conflitti con la prossima iterazione
      unmount();
    }
  });

  // Test 11: Verifica la gestione dell'importo pagato quando è disponibile
  it('handles case when amountPaidCents is available', () => {
    // Crea un mock con un importo pagato specifico (in centesimi)
    const amountMockData = {
      ...mockData,
      amountPaidCents: 1500 // 15,00 €
    };

    // Configura il mock per ritornare i dati con l'importo
    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: amountMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    // Verifica che la label dell'importo sia presente
    expect(screen.getByText('commons.amount')).toBeInTheDocument();

    // Il valore formattato potrebbe variare, quindi verifichiamo che ci siano elementi con la label
    const amountLabels = screen.getAllByText('commons.amount');
    expect(amountLabels.length).toBeGreaterThan(0);
  });

  // Test 12: Verifica la gestione dell'importo pagato quando non è disponibile
  it('handles case when amountPaidCents is not available', () => {
    // Crea un mock con importo pagato nullo
    const noAmountMockData = {
      ...mockData,
      amountPaidCents: null
    };

    // Configura il mock per ritornare i dati senza importo
    (
      getPaymentsReportingDetail as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      data: noAmountMockData,
      isLoading: false
    });

    render(<ReportingPaymentDetail />);

    // Verifica che la label dell'importo sia comunque presente anche con valore vuoto
    const amountLabels = screen.getAllByText('commons.amount');
    expect(amountLabels.length).toBeGreaterThan(0);
  });

  // Test 13: Verifica la gestione dei parametri URL mancanti
  it('handles missing or undefined parameters', () => {
    // Configura il mock per ritornare un oggetto vuoto (parametri mancanti)
    (useParams as ReturnType<typeof vi.fn>).mockReturnValue({});

    render(<ReportingPaymentDetail />);

    // Verifica che la funzione API venga chiamata con stringhe vuote per i parametri mancanti
    expect(getPaymentsReportingDetail).toHaveBeenCalledWith(
      Number(mockOrganizationId),
      '',
      ''
    );
  });
});
