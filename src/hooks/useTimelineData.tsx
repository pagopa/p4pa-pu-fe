import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, ChipOwnProps } from '@mui/material';
import { PaymentEventType } from '../../generated/core/data-contracts';

export type TimelineElement = {
  date: Date;
  content: JSX.Element;
  isFirst: boolean;
  isLast: boolean;
  statusChip?: {
    label: string;
    color: ChipOwnProps['color'];
    variant?: ChipOwnProps['variant'];
  };
};

export type RegistryItem = {
  eventDateTime?: string;
  eventType?: PaymentEventType;
  eventDescription?: string;
};

type TranslationFunction = (key: string) => string;

export const getEventStatusColor = (
  eventType: PaymentEventType
): ChipOwnProps['color'] => {
  const colorMap: Record<PaymentEventType, ChipOwnProps['color']> = {
    [PaymentEventType.DP_CREATED]: 'info',
    [PaymentEventType.DP_UPDATED]: 'primary',
    [PaymentEventType.DP_CANCELLED]: 'error',
    [PaymentEventType.DPI_ADDED]: 'success',
    [PaymentEventType.DPI_UPDATED]: 'info',
    [PaymentEventType.DPI_CANCELLED]: 'error',
    [PaymentEventType.DPI_EXPIRED]: 'error',
    [PaymentEventType.DPI_REPORTED]: 'success',
    [PaymentEventType.RT_RECEIVED]: 'success',
    [PaymentEventType.SYNC_ERROR]: 'error',
    [PaymentEventType.IO_NOTIFIED]: 'info',
    [PaymentEventType.SEND_NOTIFICATION_CREATED]: 'info',
    [PaymentEventType.SEND_NOTIFICATION_ERROR]: 'error',
    [PaymentEventType.SEND_NOTIFICATION_DATE]: 'success'
  };

  return colorMap[eventType] || 'default';
};

export const getEventDisplayInfo = (
  eventType: PaymentEventType,
  t: TranslationFunction,
  eventDescription?: string
): {
  hasDescription: boolean;
  hasStatus: boolean;
  description?: string;
  statusChip?: { label: string; color: ChipOwnProps['color'] };
} => {
  const descriptionKey = `commons.DP_DESCRIPTION.${eventType}`;
  const statusKey = `commons.DP_STATUS.${eventType}`;

  const translatedDescription = t(descriptionKey);
  const hasTranslatedDescription = translatedDescription !== descriptionKey;

  const statusLabel = t(statusKey);
  const hasStatus = statusLabel !== statusKey;

  const statusChip = hasStatus
    ? {
        label: statusLabel,
        color: getEventStatusColor(eventType)
      }
    : undefined;

  let finalDescription: string | undefined;

  if (hasTranslatedDescription) {
    if (eventDescription && eventDescription.trim() !== '') {
      finalDescription = translatedDescription.replace(
        '{{eventDescription}}',
        eventDescription
      );
    } else {
      finalDescription = translatedDescription
        .replace(' - {{eventDescription}}', '')
        .replace('{{eventDescription}}', '')
        .trim();
    }
  } else if (eventDescription && eventDescription.trim() !== '') {
    finalDescription = eventDescription;
  }

  return {
    hasDescription: !!finalDescription,
    hasStatus,
    description: finalDescription,
    statusChip
  };
};

const createTimelineElementWithoutEventType = (
  registry: RegistryItem,
  isFirst: boolean,
  isLast: boolean
): TimelineElement => ({
  date: registry.eventDateTime ? new Date(registry.eventDateTime) : new Date(),
  content: (
    <Typography variant="caption-semibold" color="text.primary" component="div">
      {registry.eventDescription || ''}
    </Typography>
  ),
  isFirst,
  isLast,
  statusChip: undefined
});

const createContentElement = (
  displayInfo: ReturnType<typeof getEventDisplayInfo>
): JSX.Element => {
  if (displayInfo.hasDescription && displayInfo.description) {
    return (
      <Typography color="text.primary" variant="caption" component="div">
        {displayInfo.description}
      </Typography>
    );
  }

  return <Typography></Typography>;
};

const createTimelineElementWithEventType = (
  registry: RegistryItem,
  isFirst: boolean,
  isLast: boolean,
  t: TranslationFunction
): TimelineElement => {
  if (!registry.eventType) {
    throw new Error('registry.eventType is required for this function');
  }

  const displayInfo = getEventDisplayInfo(
    registry.eventType,
    t,
    registry.eventDescription
  );
  const content = createContentElement(displayInfo);

  return {
    date: registry.eventDateTime
      ? new Date(registry.eventDateTime)
      : new Date(),
    content,
    isFirst,
    isLast,
    statusChip: displayInfo.statusChip
  };
};

const sortRegistriesByDate = (
  registries: Array<RegistryItem>
): Array<RegistryItem> => {
  return [...registries].sort((a, b) => {
    const dateA = a.eventDateTime ? new Date(a.eventDateTime).getTime() : 0;
    const dateB = b.eventDateTime ? new Date(b.eventDateTime).getTime() : 0;
    return dateB - dateA;
  });
};

export const useTimelineData = (
  registries: Array<RegistryItem>
): Array<TimelineElement> => {
  const { t } = useTranslation();

  return useMemo(() => {
    if (!registries || registries.length === 0) {
      return [];
    }

    const sortedRegistries = sortRegistriesByDate(registries);

    return sortedRegistries.map((registry, index) => {
      const isFirstElement = index === 0;
      const isLastElement = index === sortedRegistries.length - 1;

      if (!registry.eventType) {
        return createTimelineElementWithoutEventType(
          registry,
          isFirstElement,
          isLastElement
        );
      }

      return createTimelineElementWithEventType(
        registry,
        isFirstElement,
        isLastElement,
        t
      );
    });
  }, [registries, t]);
};
