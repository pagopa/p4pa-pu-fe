import { useTheme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import './markdownpreview.css';

type MarkdownPreviewProps = {
  message?: string;
};

const placeholders: Record<string, string> = {
  '%posizioneDebitoria_descrizione%': 'Pagamento TARI',
  '%debitore_nomeCompleto%': 'Mario Rossi',
  '%debitore_codiceFiscale%': 'RSSMRA80R11A123H',
  '%importoTotale%': '120 €',
  '%IUV%': '82000000000',
  '%NAV%': '0000 0000 0000 0000 00',
  '%causale%': 'Causale del pagamento',
  '%dataScadenza%': '12/04/2099'
};

/**
 * `MarkdownPreview` shows content rendered by markdown.
 *
 * This component allows you to use predefined placeholders to convert them into dynamic data.
 *
 * This componente uses:
 * - `ReactMarkdown` for parsing & rendering markdown.
 * - `rehype-raw` to enable HTML inline in the markdown.
 * - `remark-breaks` to support breakline as `\n`.
 * - `GenericDialog` to wrap all in a modal window.
 *
 * @component
 *
 * @param {Object} props - Component props
 * @param {string} [props.message] - Dialog message (usually the message)
 *
 * @returns {JSX.Element} Component `MarkdownPreview` rendered
 */
export const MarkdownPreview = ({
  message
}: MarkdownPreviewProps): JSX.Element => {
  const theme = useTheme();
  const secondaryColor = theme.palette.text.secondary;

  /**
   * Replaces all placeholders defined in the `placeholders` dictionary with their respective values in the provided text, highlighting them with a specific style.
   *
   * Each placeholder (e.g. `%debtor_fullname%`) is replaced with `<span>` containing the replacement text
   * and an inline style that applies a secondary color.
   *
   * @param {string} inputText - The original text which may contain placeholders
   * @returns {string} The modified text with placeholders replaced by highlighted HTML
   */
  const renderTextWithPlaceholders = (inputText: string): string => {
    let modifiedText = inputText;
    Object.keys(placeholders).forEach((placeholder: string) => {
      const regex = new RegExp(placeholder, 'g');
      modifiedText = modifiedText.replace(
        regex,
        `<span class="highlighted" style="color: ${secondaryColor} ">${placeholders[placeholder]}</span>`
      );
    });

    return modifiedText;
  };

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkBreaks]}
      components={{
        span: ({ ...props }) => {
          return <span {...props} />;
        }
      }}
    >
      {renderTextWithPlaceholders(message || '')}
    </ReactMarkdown>
  );
};
