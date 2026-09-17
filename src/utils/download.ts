import notify from "./notify";
import i18n from '../translations/i18n';


export const downloadBlob = (blob: Blob, fileName: string): void => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch {
    notify.emit(i18n.t('commons.files.downloadFailed'), 'error');
  }
};

export const downloadFileFromUrl = async (fileUrl?: string, fileName?: string) => {
  if (!fileUrl) {
    notify.emit(i18n.t('commons.files.downloadFailed'), 'error');
    return;
  }
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(fileUrl, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
    });
    if (!response.ok) {
      notify.emit(i18n.t('commons.files.downloadFailed'), 'error');
      return;
    }
    const blob = await response.blob();
    downloadBlob(blob, fileName || '');
  } catch {
    notify.emit(i18n.t('commons.files.downloadFailed'), 'error');
  }
};

export default {
  downloadBlob,
  downloadFileFromUrl
};
