import { ClassificationsEnum } from '../../../../generated/core/data-contracts';

export const CLASSIFICATION_SEVERITY_MAP = {
  // SUCCESS
  [ClassificationsEnum.IUD_RT_IUF]: 'success',
  [ClassificationsEnum.RT_IUF]: 'success',
  [ClassificationsEnum.RT_TES]: 'success',
  [ClassificationsEnum.IUD_RT_IUF_TES]: 'success',
  [ClassificationsEnum.RT_IUF_TES]: 'success',

  // WARNING
  [ClassificationsEnum.RT_NO_IUF]: 'warning',
  [ClassificationsEnum.RT_NO_IUD]: 'warning',
  [ClassificationsEnum.IUF_NO_TES]: 'warning',

  // ERROR
  [ClassificationsEnum.DOPPI]: 'error',
  [ClassificationsEnum.IUV_NO_RT]: 'error',
  [ClassificationsEnum.TES_NO_IUF_OR_IUV]: 'error',
  [ClassificationsEnum.IUF_TES_DIV_IMP]: 'error',
  [ClassificationsEnum.IUD_NO_RT]: 'error',
  [ClassificationsEnum.TES_NO_MATCH]: 'error',
  [ClassificationsEnum.UNKNOWN]: 'error'
} as const;

export const CLASSIFICATION_ALERT_KEYS = {
  // SUCCESS
  [ClassificationsEnum.IUD_RT_IUF]: {
    title:
      'classifications.detail.statusBar.status.alerts.correctlyReported.title',
    description:
      'classifications.detail.statusBar.status.alerts.correctlyReported.description'
  },
  [ClassificationsEnum.RT_IUF]: {
    title: 'classifications.detail.statusBar.status.alerts.reported.title',
    description:
      'classifications.detail.statusBar.status.alerts.reported.description'
  },
  [ClassificationsEnum.RT_TES]: {
    title:
      'classifications.detail.statusBar.status.alerts.punctualReversal.title',
    description:
      'classifications.detail.statusBar.status.alerts.punctualReversal.description'
  },
  [ClassificationsEnum.IUD_RT_IUF_TES]: {
    title: 'classifications.detail.statusBar.status.alerts.notified.title',
    description:
      'classifications.detail.statusBar.status.alerts.notified.description'
  },
  [ClassificationsEnum.RT_IUF_TES]: {
    title:
      'classifications.detail.statusBar.status.alerts.cumulativeReversal.title',
    description:
      'classifications.detail.statusBar.status.alerts.cumulativeReversal.description'
  },

  // WARNING
  [ClassificationsEnum.RT_NO_IUF]: {
    title:
      'classifications.detail.statusBar.status.alerts.incorrectlyReported.title',
    description:
      'classifications.detail.statusBar.status.alerts.incorrectlyReported.description'
  },
  [ClassificationsEnum.RT_NO_IUD]: {
    title:
      'classifications.detail.statusBar.status.alerts.incorrectlyNotified.title',
    description:
      'classifications.detail.statusBar.status.alerts.incorrectlyNotified.description'
  },
  [ClassificationsEnum.IUF_NO_TES]: {
    title:
      'classifications.detail.statusBar.status.alerts.incorrectlyReversed.title',
    description:
      'classifications.detail.statusBar.status.alerts.incorrectlyReversed.description'
  },

  // ERROR
  [ClassificationsEnum.DOPPI]: {
    title:
      'classifications.detail.statusBar.status.alerts.duplicatePayments.title',
    description:
      'classifications.detail.statusBar.status.alerts.duplicatePayments.description'
  },
  [ClassificationsEnum.IUV_NO_RT]: {
    title:
      'classifications.detail.statusBar.status.alerts.unexecutedReporting.title',
    description:
      'classifications.detail.statusBar.status.alerts.unexecutedReporting.description'
  },
  [ClassificationsEnum.TES_NO_IUF_OR_IUV]: {
    title:
      'classifications.detail.statusBar.status.alerts.unrecognizedReversal.title',
    description:
      'classifications.detail.statusBar.status.alerts.unrecognizedReversal.description'
  },
  [ClassificationsEnum.IUF_TES_DIV_IMP]: {
    title:
      'classifications.detail.statusBar.status.alerts.differentAmountReversal.title',
    description:
      'classifications.detail.statusBar.status.alerts.differentAmountReversal.description'
  },
  [ClassificationsEnum.IUD_NO_RT]: {
    title:
      'classifications.detail.statusBar.status.alerts.notifiedNotExecuted.title',
    description:
      'classifications.detail.statusBar.status.alerts.notifiedNotExecuted.description'
  },
  [ClassificationsEnum.TES_NO_MATCH]: {
    title:
      'classifications.detail.statusBar.status.alerts.unrecognizedTreasuryReversal.title',
    description:
      'classifications.detail.statusBar.status.alerts.unrecognizedTreasuryReversal.description'
  },

  // UNKNOWN
  [ClassificationsEnum.UNKNOWN]: {
    title: 'classifications.detail.statusBar.status.alerts.default.title',
    description:
      'classifications.detail.statusBar.status.alerts.default.description'
  }
} as const;
