import { useMutation } from '@tanstack/react-query';
import {
  PaidExportFileRequest,
  ReceiptsArchivingExportFileRequest,
  RequestParams
} from '../../generated/apiClient';
import utils from '../utils';

export const createPaidExportFile = () =>
  useMutation({
    mutationKey: ['createPaidExportFile'],
    mutationFn: async ({
      data,
      params
    }: {
      data: PaidExportFileRequest;
      params?: RequestParams;
    }) => {
      const response = await utils.apiClient.bff.createPaidExportFile(
        data,
        params
      );
      return response;
    }
  });

export const createReceiptsArchivingExportFile = () =>
  useMutation({
    mutationKey: ['createReceiptsArchivingExportFile'],
    mutationFn: async ({
      data,
      params
    }: {
      data: ReceiptsArchivingExportFileRequest;
      params?: RequestParams;
    }) => {
      const response =
        await utils.apiClient.bff.createReceiptsArchivingExportFile(
          data,
          params
        );
      return response;
    }
  });
