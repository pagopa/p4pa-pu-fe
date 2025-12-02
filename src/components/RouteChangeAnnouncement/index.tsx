import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

export const RouteChangeAnnouncement = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const isInitialMount = useRef(true);

  const updateMessage = () => {
    const page = document?.title.replace(/ - .+$/, ''); // Remove trailing app name
    const mainContent = document.getElementById('main-content');

    // This IF is useful to set the focus only on route changes, not on the initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (mainContent) {
        mainContent.focus();
      }
      const newMessage = t('a11y.navigation.announcement', {
        page
      });
      setMessage(newMessage);
    }
  };

  useEffect(() => {
    // Clear message to reset live region
    setMessage('');
    const timeoutId = setTimeout(updateMessage, 200); // helps with screen readers
    return () => clearTimeout(timeoutId);
  }, [location]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        margin: '-1px',
        border: '0',
        padding: '0',
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)'
      }}
      key={message} // Ensure React recreates element on message change
      id={message}
    >
      {message}
    </div>
  );
};
