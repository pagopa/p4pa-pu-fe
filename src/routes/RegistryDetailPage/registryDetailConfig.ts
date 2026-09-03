import React from 'react';
import {
  DetailData,
  DetailSectionProps
} from '../../components/DetailContainer/DetailContainer';
import {
  PagoPaRegistryDTO,
  SilRegistryDTO
} from '../../../generated/core/data-contracts';
import { ExpandableCard } from './components/ExpandableCard';
import { formatDateTime } from '../../utils/formatters';

type RegistryData = PagoPaRegistryDTO | SilRegistryDTO;

export const isPagoPaRegistry = (
  registry: RegistryData
): registry is PagoPaRegistryDTO => {
  return 'eventCategory' in registry;
};

export const isSilRegistry = (
  registry: RegistryData
): registry is SilRegistryDTO => {
  return 'brokerFiscalCode' in registry;
};

export const mapRegistryToDetailSections = (
  registry: RegistryData,
  t: (key: string) => string
): DetailSectionProps['sections'] => {
  const eventData: Array<DetailData> = [
    {
      label: t('registry.detail.eventType'),
      value: registry.eventType
    },
    {
      label: t('registry.detail.eventSubType'),
      value: registry.eventSubType
    },
    ...(isPagoPaRegistry(registry)
      ? [
          {
            label: t('registry.detail.eventCategory'),
            value: registry.eventCategory
          }
        ]
      : []),
    {
      label: t('registry.detail.outcome'),
      value: registry.outcome
    }
  ];

  const detailsData: Array<DetailData> = [
    {
      label: t('registry.detail.dateTime'),
      value: registry.dateTime
        ? formatDateTime(registry.dateTime as string)
        : ''
    },
    {
      label: t('registry.detail.registryId'),
      value: registry.registryId
    },
    {
      label: t('commons.iuv'),
      value: registry.iuv
    },
    {
      label: t('commons.nav'),
      value: registry.nav
    },
    ...(isPagoPaRegistry(registry)
      ? [
          {
            label: t('registry.detail.paymentChannel'),
            value: registry.pspChannelId
          },
          {
            label: t('registry.detail.intermediateStationPA'),
            value: registry.brokerStationId
          }
        ]
      : [])
  ];

  const interfaceParams: Array<DetailData> = [];
  if (registry.body) {
    const bodyContent =
      typeof registry.body === 'string'
        ? registry.body
        : JSON.stringify(registry.body, null, 2);

    interfaceParams.push({
      value: bodyContent,
      childrenComponent: React.createElement(ExpandableCard, {
        content: bodyContent,
        t: t,
        maxPreviewLength: 200
      })
    });
  } else {
    interfaceParams.push({
      label: t('registry.detail.noInterfaceParams'),
      value: t('registry.detail.noInterfaceParamsDescription')
    });
  }

  const sections: DetailSectionProps['sections'] = [
    {
      title: {
        label: t('registry.detail.event'),
        variant: 'overline'
      },
      data: eventData,
      inline: true
    },
    {
      title: {
        label: t('registry.detail.details'),
        variant: 'overline'
      },
      data: detailsData,
      inline: true
    },
    {
      title: {
        label: t('registry.detail.interfaceSpecificParamsTitle'),
        variant: 'overline'
      },
      data: interfaceParams,
      inline: false
    }
  ];

  return sections;
};
