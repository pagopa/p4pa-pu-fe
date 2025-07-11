import { ChipOwnProps } from '@mui/material/Chip';

/**
 * Types of assessment status
 */
export type AssessmentStatus = 'ACTIVE' | 'CLOSED' | 'CANCELLED';

/**
 * Mapping of colors for assessment status
 * ACTIVE: green (success)
 * CLOSED: gray (default)
 * CANCELLED: red (error)
 */
export const assessmentStateColors: Record<
  AssessmentStatus,
  ChipOwnProps['color']
> = {
  ACTIVE: 'success',
  CLOSED: 'default',
  CANCELLED: 'error'
};

/**
 * Function to get the props of the status chip for an assessment
 * @param status - The status of the assessment
 * @param t - Translation function
 * @returns The props of the chip (label and color)
 */
export const getAssessmentStatusChipProps = (
  status: string,
  t: (key: string) => string
): { label: string; color: ChipOwnProps['color'] } => {
  const isValidStatus = Object.keys(assessmentStateColors).includes(status);

  if (!isValidStatus) {
    return {
      label: 'Unknown',
      color: 'default'
    };
  }

  const statusKey = status as AssessmentStatus;
  return {
    label: t(`assessment.statusOptions.${statusKey}`),
    color: assessmentStateColors[statusKey]
  };
};
