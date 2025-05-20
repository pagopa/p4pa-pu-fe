import { useTranslation } from 'react-i18next';

export const ErrorMessage = ({
  messageKey
}: {
  messageKey: string | undefined;
}) => {
  const { t } = useTranslation();
  return messageKey ? t(messageKey) : '';
};
