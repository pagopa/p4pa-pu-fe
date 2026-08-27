import { useMemo } from 'react';
import {
  CLASSIFICATION_SEVERITY_MAP,
  CLASSIFICATION_ALERT_KEYS
} from '../utils/classificationAlerts';
import {
  ClassificationDetailDTO,
  ClassificationsEnum
} from '../../../../generated/core/data-contracts';

export const useClassificationAlert = (data: ClassificationDetailDTO) => {
  return useMemo(() => {
    const { label, paid, reported, collected } = data;

    if (!paid && !reported && Boolean(collected)) {
      return {
        severity: 'error' as const,
        titleKey:
          'classifications.detail.statusBar.status.alerts.unknownTreasuryReversals.title',
        descriptionKey:
          'classifications.detail.statusBar.status.alerts.unknownTreasuryReversals.description'
      };
    }

    const classificationKey = label as ClassificationsEnum;
    const severity =
      CLASSIFICATION_SEVERITY_MAP[classificationKey] || 'success';
    const alertKeys =
      CLASSIFICATION_ALERT_KEYS[classificationKey] ||
      CLASSIFICATION_ALERT_KEYS[ClassificationsEnum.UNKNOWN];

    return {
      severity,
      titleKey: alertKeys.title,
      descriptionKey: alertKeys.description
    };
  }, [data]);
};
