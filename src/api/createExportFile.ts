import { useMutation } from '@tanstack/react-query';
import { ExportFileRequestDTO, RequestParams } from '../../generated/apiClient';
import utils from '../utils';

export const createExportFile = () =>
  useMutation({
    mutationKey: ['createExportFile'],
    mutationFn: async ({
      data,
      params
    }: {
      data: ExportFileRequestDTO;
      params?: RequestParams;
    }) => {
      await utils.apiClient.bff.createExportFile(data, params);
    }
  });
