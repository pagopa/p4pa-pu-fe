import { NodoFilterValues } from '../../routes/Events/configs';
import utils from '../../utils';

export type NodoFilterValuesFilteredRequest = {
  filters: NodoFilterValues;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

type getPagoPaRegistries = Parameters<
  typeof utils.apiClient.bff.getPagoPaRegistries
>[1];

export const buildQueryParams = ({
  filters,
  pagination,
  sort
}: NodoFilterValuesFilteredRequest): getPagoPaRegistries => ({
  eventType: filters.event,
  eventDateTimeFrom: utils.formatters.date.code(filters.eventDate?.from),
  eventDateTimeTo: utils.formatters.date.code(filters.eventDate?.to),
  iuv: filters.iuv,
  outcome: filters.outcome,
  page: pagination.page,
  size: pagination.size,
  sort
});
