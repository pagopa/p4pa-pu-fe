import { usePersistentSignal } from '../hooks/usePersistentSignal';
import { UserMemo } from '../models/User';
import { STATE } from './types';

// Initialize the persistent store
export const userInfoState = usePersistentSignal<UserMemo | undefined>(STATE.USER_INFO, {
  storage: sessionStorage
});

// Function to update the user info
export function setUserInfo(user: UserMemo | undefined) {
  userInfoState.state.value = user;
}
