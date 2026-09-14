import notify from "./notify";

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
    notify.emit('File download failed', 'error');
  }
};

export const downloadFileFromUrl = async (fileUrl?: string, fileName?: string) => {
  if (!fileUrl) {
    notify.emit('File URL is missing', 'error');
    return;
  }
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(fileUrl, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
    });
    if (!response.ok) {
      notify.emit('File download failed', 'error');
      return;
    }
    const blob = await response.blob();
    downloadBlob(blob, fileName || '');
  } catch {
    notify.emit('File download failed', 'error');
  }
};

export default {
  downloadBlob,
  downloadFileFromUrl
};
