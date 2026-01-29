import { i18nTestSetup } from '../../__tests__/i18nTestSetup';
import { render, screen } from '../../__tests__/renderers';
import IoMessageGuidePage from './IoMessageGuidePage';

const translations = {
  ioMessageGuide: {
    title: 'Come scrivere un messaggio su IO?',
    description:
      'Qui puoi trovare informazione utile per scrivere un messaggio su IO per avvisi di pagamento',
    sections: {
      howToWrite: {
        title: 'Cosa scrivere in un messaggio?',
        description:
          "Semplifica la comunicazione con i cittadini utilizzando i template predefiniti di pagoPA per l'app IO.\nSeleziona il template più adatto al tuo servizio, copia il contenuto e personalizzalo in base alle specifiche esigenze del tuo ente.",
        link: 'Template messaggio'
      },
      howToFormat: {
        title: 'Come formattare un messaggio?',
        description:
          'Personalizza i messaggi su IO con Markdown: aggiungi formattazione, link e elementi interattivi per comunicare in modo più chiaro ed efficace con i cittadini.',
        link: 'Guida al markdown'
      },
      dynamicFields: {
        title: 'Come usare i campi dinamici?',
        description:
          "I campi dinamici permettono di personalizzare determinati aspetti di un messaggio come il nome e cognome del destinatario, l'importo del pagamento, la scadenza, ecc.\nUtilizza i tag riportati nella tabella all'interno del corpo del messaggio per personalizzarlo.",
        alert:
          "I dati vengono inseriti automaticamente solo quando l'avviso riguarda un debitore e una rata"
      }
    },
    dynamicFields: {
      debtorName: { name: 'Nome debitore' },
      fiscalCode: { name: 'Codice Fiscale' },
      totalAmount: { name: 'Importo Totale' },
      iuv: { name: 'IUV', tooltip: 'Identificativo Univoco di Versamento' },
      noticeCode: {
        name: 'Codice Avviso',
        tooltip: 'Codice necessario per il pagamento'
      },
      paymentReason: {
        name: 'Oggetto di pagamento',
        tooltip: "Motivo per il quale viene emessa l'avviso di pagamento"
      },
      dueDate: { name: 'Data scadenza' }
    },
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

describe('IoMessageGuidePage', () => {
  beforeEach(() => {
    i18nTestSetup(translations);
  });

  it('should render the page title', () => {
    render(<IoMessageGuidePage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: translations.ioMessageGuide.title
      })
    ).toBeInTheDocument();
  });

  it('should render the page description', () => {
    render(<IoMessageGuidePage />);

    expect(
      screen.getByText(translations.ioMessageGuide.description)
    ).toBeInTheDocument();
  });

  it('should render the "how to write" section', () => {
    render(<IoMessageGuidePage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: translations.ioMessageGuide.sections.howToWrite.title
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Template messaggio/i })
    ).toBeInTheDocument();
  });

  it('should render the "how to format" section', () => {
    render(<IoMessageGuidePage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: translations.ioMessageGuide.sections.howToFormat.title
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Guida al markdown/i })
    ).toBeInTheDocument();
  });

  it('should render the "dynamic fields" section', () => {
    render(<IoMessageGuidePage />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: translations.ioMessageGuide.sections.dynamicFields.title
      })
    ).toBeInTheDocument();
  });

  it('should render the info alert', () => {
    render(<IoMessageGuidePage />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByText(translations.ioMessageGuide.sections.dynamicFields.alert)
    ).toBeInTheDocument();
  });

  it('should render external links with target="_blank"', () => {
    render(<IoMessageGuidePage />);

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
