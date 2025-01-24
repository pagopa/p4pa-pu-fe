import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

type MarkdownTextProps = {
  children: string | undefined | null;
};

const allowedTags = {
  tagNames: ['strong', 'em', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'br']
};

export const Markdown = ({ children: markdown }: MarkdownTextProps) => (
  <ReactMarkdown
    data-testid="markdown-content"
    children={markdown}
    rehypePlugins={[
      [
        rehypeSanitize,
        {
          allowDangerousHtml: false,
          ...allowedTags
        }
      ]
    ]}
  />
);
