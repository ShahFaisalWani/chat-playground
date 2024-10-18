import { AuthType } from "@/types";
import { create } from 'zustand';


interface AuthState {
  auth: AuthType
  setAuth: (authData: AuthType) => void;
  resetAuth: () => void;
}

const INITIAL_STATE = {
  logged_in: false,
  user_id: null,
  username: '',
  email: '',
};

export const useAuthStore = create<AuthState>((set) => ({
  auth: INITIAL_STATE,

  setAuth: (authData) =>
    set({
      auth: {
        logged_in: true,
        user_id: authData.user_id,
        username: authData.username,
        email: authData.email,
      },
    }),

  resetAuth: () =>
    set({
      auth: INITIAL_STATE,
    }),
}));
