import { UserMemo } from '../models/User';
import { STATE } from '../store/types';
import { useStore } from '../store/GlobalStore';

export const useUserInfo = () => {
  const { setState, state } = useStore();

  /* TO-DO service to obtain user data */
  const data = { email: 'marcopolo@ilmilione.it',
    name: 'Marco',
    familyName: 'Polo',
    userId: 'marcopolo'
  };
  const user: UserMemo = { name: data.name, familyName: data.familyName, userId: data.userId };
  setState(STATE.USER_INFO, user);
  

  return { userInfo: state.userInfo };
};
