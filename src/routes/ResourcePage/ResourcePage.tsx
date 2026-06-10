import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ResourceType } from '../../utils/resources';
import ReactMarkdown from 'react-markdown';
import loaders from '../../utils/loaders';
import { configFeState } from '../../store/ConfigFeStore';

type Props = {
  resource: ResourceType;
};

export const ResourcePage = ({ resource }: Props) => {
  const { t, i18n } = useTranslation();

  const externalId = configFeState.value?.externalId || '';
  const { data: content, isError } = loaders.useResourceContent(
    resource,
    i18n.language,
    externalId
  );

  if (isError) {
    return (
      <Box padding={3} minHeight="100vh">
        <Typography color="error">{t('resourcePage.error')}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="flex-start"
        minHeight="100vh"
        flexDirection={'column'}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </Box>
    </>
  );
};

export default ResourcePage;
