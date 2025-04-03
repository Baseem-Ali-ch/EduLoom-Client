import { createAction, props } from '@ngrx/store';
import { IUser } from '../../core/models/IUser';

export const register = createAction(
  '[Auth] Register',
  props<{ userName: string; email: string; password: string }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: IUser }>()
);

export const registerError = createAction(
  '[Auth] Register Fail',
  props<{ error: string }>()
);

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);
