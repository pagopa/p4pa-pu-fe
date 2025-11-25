import { generatePath } from 'react-router';

import { PageRoutes } from '../routes';

const buildSearchParams = (iud?: string): string => {
  if (!iud) {
    return '';
  }

  const params = new URLSearchParams({ iud });
  return `?${params.toString()}`;
};

export const appendReceiptIudQuery = (path: string, iud?: string): string => {
  return `${path}${buildSearchParams(iud)}`;
};

export const buildTelematicReceiptDetailPath = (
  receiptId: number | string,
  iud?: string
): string => {
  const path = generatePath(PageRoutes.TELEMATIC_RECEIPT_DETAIL, {
    receiptId: String(receiptId)
  });

  return appendReceiptIudQuery(path, iud);
};

export default {
  buildTelematicReceiptDetailPath,
  appendReceiptIudQuery
};
