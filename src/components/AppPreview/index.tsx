import { useState } from 'react';
import { PreviewButton } from './Button';
import { Phone } from './Phone';
import { NotificationPreview } from '../NotificationPreview';

type AppPreviewProps = {
  message?: string;
  subject?: string;
};

export const AppPreview = ({ message = '', subject = '' }: AppPreviewProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Phone open={open} onClose={() => setOpen(false)}>
        <NotificationPreview title={subject} message={message} />
      </Phone>
      <PreviewButton
        onClick={() => setOpen(true)}
        disabled={!message || !subject}
      />
    </>
  );
};
