import { useMutation, useQuery } from '@tanstack/react-query';
import utils from '../../utils';
import { parseAndLog } from '../../utils/loaders';
import {
  pagedSpontaneousFormSchema,
  spontaneousFormDetailDTOSchema,
  spontaneousFormSchema
} from '../../../generated/core/zod-schema';
import { SpontaneousForm } from '../../../generated/core/client';
import { buildQueryParams, SpontaneousFormsFilteredRequest } from './mappings';

const getSpontaneousForms = ({ organizationId }: { organizationId: number }) =>
  useMutation({
    mutationKey: ['getSpontaneousForms', organizationId],
    mutationFn: async (args: SpontaneousFormsFilteredRequest) => {
      const query = buildQueryParams(args);
      const { data } = await utils.apiClient.bff.getPagedSpontaneousForms(
        organizationId,
        query
      );

      parseAndLog(pagedSpontaneousFormSchema, data);
      return data;
    }
  });

const getSpontaneousFormById = ({
  organizationId,
  spontaneousFormId
}: {
  organizationId: number;
  spontaneousFormId: number;
}) =>
  useQuery({
    queryKey: ['spontaneousForm', organizationId, spontaneousFormId],
    queryFn: async () => {
      const { data } = await utils.apiClient.bff.getSpontaneousFormDetail(
        organizationId,
        spontaneousFormId
      );

      parseAndLog(spontaneousFormDetailDTOSchema, data);
      return { response: data };
    }
  });

const createSpontaneousForm = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['createSpontaneousForm', organizationId],
    mutationFn: async (payload: SpontaneousForm) => {
      const { data } = await utils.apiClient.bff.createSpontaneousForm(
        organizationId,
        payload
      );

      parseAndLog(spontaneousFormSchema, data);
      return data;
    }
  });

const deleteSpontaneousForm = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['deleteSpontaneousForm', organizationId],
    mutationFn: async (spontaneousFormId: number) => {
      await utils.apiClient.bff.deleteSpontaneousForm(
        organizationId,
        spontaneousFormId
      );
    }
  });

const updateSpontaneousForm = ({
  organizationId
}: {
  organizationId: number;
}) =>
  useMutation({
    mutationKey: ['updateSpontaneousForm', organizationId],
    mutationFn: async (payload: SpontaneousForm) => {
      // API returns void, no data to parse
      await utils.apiClient.bff.updateSpontaneousForm(organizationId, payload);
    }
  });

/**
 * Simple list query for dropdowns and selectors.
 * Uses the non-paginated API endpoint.
 */
const getSpontaneousFormsList = (organizationId: number, enabled = true) =>
  useQuery({
    queryKey: ['getSpontaneousFormsList', organizationId],
    queryFn: async () => {
      const { data } =
        await utils.apiClient.bff.getSpontaneousForms(organizationId);
      parseAndLog(spontaneousFormSchema.array(), data);
      return data;
    },
    enabled: !!organizationId && enabled
  });

export default {
  getSpontaneousForms,
  getSpontaneousFormsList,
  getSpontaneousFormById,
  createSpontaneousForm,
  deleteSpontaneousForm,
  updateSpontaneousForm
};
