
interface DetailFlowData {
  title: string,
  downloadButton?: boolean,
  splitCard?: boolean,
}

type DetailsFlowData = Record<string, DetailFlowData>

export const detailConfig: DetailsFlowData = {
  'receipt': {
    title: 'telematicReceiptDetail.title',
    downloadButton: true,
    splitCard: true
  },
  'reporting': {
    title: 'commons.routes.REPORTING_PAYMENT_DETAIL',
    splitCard: true
  },
  'treasury': {
    title: 'treasury.billDetail',
    downloadButton: true
  }
};