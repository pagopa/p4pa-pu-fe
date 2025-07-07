import { ChipOwnProps } from '@mui/material/Chip';

/**
 * Tipi di stato degli accertamenti
 */
export type AssessmentStatus = 'NEW' | 'CLOSED' | 'CANCELLED';

/**
 * Mapping dei colori per gli stati degli accertamenti
 * NEW: verde (success)
 * CLOSED: grigio (default)
 * CANCELLED: rosso (error)
 */
export const assessmentStateColors: Record<
  AssessmentStatus,
  ChipOwnProps['color']
> = {
  NEW: 'success',
  CLOSED: 'default',
  CANCELLED: 'error'
};

/**
 * Funzione per ottenere le props della chip di stato per un accertamento
 * @param status - Lo stato dell'accertamento
 * @param t - Funzione di traduzione
 * @returns Le props della chip (label e color)
 */
export const getAssessmentStatusChipProps = (
  status: string,
  t: (key: string) => string
): { label: string; color: ChipOwnProps['color'] } => {
  const isValidStatus = Object.keys(assessmentStateColors).includes(status);

  if (!isValidStatus) {
    return {
      label: 'Sconosciuto',
      color: 'default'
    };
  }

  const statusKey = status as AssessmentStatus;
  return {
    label: t(`assessment.statusOptions.${statusKey}`),
    color: assessmentStateColors[statusKey]
  };
};
