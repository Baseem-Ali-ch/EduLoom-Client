import { createReducer, on } from '@ngrx/store';
import { IAuthState } from '../../core/models/IUser';
import { login, register, registerError, registerSuccess } from './user.action';

const initialState: IAuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(register, (state) => ({ ...state, loading: true, error: null })),
  on(registerSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
  })),
  on(registerError, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(login, (state) => ({ ...state, loading: true, error: null }))
);
