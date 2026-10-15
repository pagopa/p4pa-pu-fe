import notify from './notify';

export const copyToClipboard = async (
  text: string,
  onCopied: (state: boolean) => void
) => {
  await navigator.clipboard.writeText(text);
  onCopied(true);
  setTimeout(() => onCopied(false), 2000); // Reset after 2 seconds
};

export const copyWithFeedback = (value: string, feedback: string) => {
  copyToClipboard(value, () => notify.emit(feedback, 'success'));
};
