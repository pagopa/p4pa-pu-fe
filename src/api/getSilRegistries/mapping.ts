import { SilFilterValues } from '../../routes/Events/configs';
import utils from '../../utils';

export type SilRegistriesFilteredRequest = {
  filters: SilFilterValues;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

type getSilRegistriesQueryParameters = Parameters<
  typeof utils.apiClient.bff.getSilRegistries
>[1];

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: SilRegistriesFilteredRequest): getSilRegistriesQueryParameters => ({
  eventType: filters.event,
  eventDateTimeFrom: utils.formatters.date.code(filters.eventDate?.from),
  eventDateTimeTo: utils.formatters.date.code(filters.eventDate?.to),
  iuv: filters.iuv,
  outcome: filters.outcome,
  page: pagination.page,
  size: pagination.size,
  sort
});
