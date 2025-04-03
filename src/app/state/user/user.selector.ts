import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IAuthState } from '../../core/models/IUser';
import { AppState } from './user.state';

export const selectRegistrationState = (state: AppState) => state.registration;
const selectAuthState = createFeatureSelector<IAuthState>('auth');

export const selectUser = createSelector(
  selectRegistrationState,
  (state: IAuthState) => state.user
);

export const selectError = createSelector(
  selectRegistrationState,
  (state: IAuthState) => state.error
);

export const selectIsLoading = createSelector(
  selectRegistrationState,
  (state: IAuthState) => state.loading
);
export const selectLoginDetails = createSelector(
    selectAuthState,
    (state: IAuthState) => ({
      user: state.user, // This should be of type User | null
      loading: state.loading,
      error: state.error,
    })
  );
