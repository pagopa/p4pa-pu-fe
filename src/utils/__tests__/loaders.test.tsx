import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMock } from 'zodock';
import * as schemas from '../../../generated/zod-schema';
import utils from '..';
import { AxiosResponse } from 'axios';
import loaders from '../loaders';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { renderHook, waitFor } from '../../__tests__/renderers';


const queryClient = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider> );

describe('api loaders', () => {


  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('Organizations API', () => {

    it('should call getOrganizations obtaining a formal response', async () => {
      const dataMock = [ createMock(schemas.organizationDTOSchema.required()) ] ;

      const apiMock = vi.spyOn(utils.apiClient.bff, 'getOrganizations').mockResolvedValue({
        data: dataMock,
        headers: {}
      } as AxiosResponse);

      const { result } = renderHook(() => loaders.getOrganizations(), {
        wrapper
      });

      await waitFor(() => {
        expect(apiMock).toHaveBeenCalled();
        expect(result.current.isSuccess).toBeTruthy();
        expect(result.current.data).toEqual(dataMock);
      });

    });


  });
});
