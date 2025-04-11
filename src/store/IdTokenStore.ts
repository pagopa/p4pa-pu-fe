import { signal } from '@preact/signals-react';
import { jwtDecode } from 'jwt-decode';
import { IdTokenPayload } from '../models/IdTokenPayload';

export const idTokenPayloadState = signal<IdTokenPayload | undefined>();

export function setIdToken(token: string) {
  const decoded = jwtDecode<IdTokenPayload>(token);
  const payload: IdTokenPayload = {
    organization: {
      fiscal_code: decoded?.organization?.fiscal_code,
      ipaCode: decoded?.organization?.ipaCode
    }
  };
  idTokenPayloadState.value = payload;
}
