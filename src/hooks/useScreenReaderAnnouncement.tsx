import { setAnnouncement } from '../store/AppStateStore';

export const useScreenReaderAnnouncement = () => {
  // Announce to screen readers
  const announce = (message: string) => {
    setAnnouncement('');
    // Force reflow to trigger screen reader message
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  };

  return {
    announce
  };
};
