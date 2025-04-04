import { signal } from '@preact/signals-react';
import { UserInfo } from '../../generated/data-contracts';

// Initialize the persistent store
export const userInfoState = signal<UserInfo | undefined>();

// Function to update the user info
export function setUserInfo(user: UserInfo | undefined) {
  userInfoState.value = user;
}
